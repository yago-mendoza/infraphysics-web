---
id: openclaw-containment-playbook
displayTitle: "OpenClaw containment playbook"
subtitle: "Docker, VMs, cloud deployment, and credential hygiene — running AI agents without handing over the keys"
category: bits2bricks
date: 2026-02-09
thumbnail: https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop
thumbnailAspect: wide
description: "Step-by-step guide to running OpenClaw safely using containers, VMs, network segmentation, and cloud deployment. Every technique ranked by effort and protection."
tags: [ai, security, docker, networking, agents, openclaw, devops]
related: [openclaw-and-the-keys-to-your-kingdom]
---

This is the companion piece to [OpenClaw and the keys to your kingdom](/blog/threads/openclaw-and-the-keys-to-your-kingdom). That article covers the --why-- — what "full system access" actually means, what an AI agent can reach on your machine and network, and why the supply chain is the part that should keep you up at night. This one covers the --how-- — specific techniques for containing the agent, ranked by effort and protection, with real commands and real tradeoffs.

If you haven't read the thread, the one-paragraph version: OpenClaw is an open-source AI agent that runs on your computer and acts autonomously — reading files, running commands, accessing your network, all controlled from your phone via WhatsApp or Telegram. It's genuinely useful. It's also a process running as your user with access to your SSH keys, your cloud credentials, your browser sessions, and every device on your LAN. A community skill was already found containing malware. The question isn't whether to use it — it's how to contain it.

---

# The threat model in 60 seconds

Before picking a containment strategy, you need to know what you're containing. Here's what a user-level process on your machine can access --silently, without any prompt or password--:

| What | Where | Why it matters |
|---|---|---|
| SSH private keys | `~/.ssh/id_ed25519` | Passwordless access to every server that key authenticates to. Unencrypted by default. |
| Cloud credentials | `~/.aws/credentials`, `~/.kube/config` | Full access to your AWS account, Kubernetes clusters, etc. Plaintext. |
| Environment secrets | `.env` files in every project | API keys, database passwords, third-party tokens. |
| Firefox cookies | `~/.mozilla/firefox/*/cookies.sqlite` | --Unencrypted-- session tokens. A cookie for your bank = logged in. |
| Signal/Telegram DBs | `~/Library/Application Support/Signal/` | Message history. Signal's encryption key was stored in plaintext until recently. |
| Git tokens | `~/.git-credentials` | If credential helper is `store`, your GitHub token is plaintext. |
| Local network | Every device on your LAN | NAS, cameras, smart home, partner's laptop — all reachable. |

And what the OS --does-- protect, even from same-user processes:

| What | Why it's protected |
|---|---|
| macOS Keychain passwords | Encrypted by {{Secure Enclave|a physically separate chip that holds encryption keys and never releases them to software. First-time access from a new app triggers a system prompt.}} hardware. |
| Chrome saved passwords (macOS/Windows) | Encryption key lives in Keychain or {{DPAPI|Windows Data Protection API. Binds encryption to the user account. Chrome adds "App-Bound Encryption" on top since version 127.}}. |
| Kernel operations | Installing drivers or extensions requires admin password elevation. |
| Hardware-backed keys | TPM / Secure Enclave — physically cannot be extracted by software. |

The containment goal: keep the agent's access to the green table. Block its access to the red table. Every technique below does some version of this.

---

# Option 1: Docker

## Why Docker is the sweet spot

Running the agent in a {{Docker container|a tool that creates isolated environments called containers. The program inside gets its own filesystem, its own process list, and its own network. It cannot see the host's files or network unless you explicitly mount a path or expose a port.}} gives you filesystem isolation, network isolation, and capability restriction in a single command. For most threat models — a misbehaving agent, a malicious skill, accidental data exfiltration — it's enough.

## The locked-down command

```bash
docker run --rm -it \
  --network=none \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,size=512m \
  --cap-drop=ALL \
  --security-opt=no-new-privileges \
  --memory=4g \
  --cpus=2 \
  -v /path/to/project:/workspace:ro \
  -v /path/to/output:/output:rw \
  your-agent-image
```

Flag-by-flag:

- `--network=none` — --zero network access--. No DNS, no HTTP, no LAN scanning. The container only has a loopback interface. This single flag blocks all exfiltration vectors.
- `--read-only` — container's root filesystem is read-only. The agent can't install packages, modify system files, or write outside the mounted output directory.
- `--tmpfs /tmp:rw,noexec,nosuid,size=512m` — writable temp space in RAM only (512 MB max), no executable binaries allowed.
- `--cap-drop=ALL` — drops all 14 default Linux {{capabilities|special privileges containers get by default: CHOWN (change file ownership), DAC_OVERRIDE (bypass file read/write checks), FOWNER, FSETID, KILL, SETGID, SETUID, SETPCAP, NET_BIND_SERVICE, NET_RAW, SYS_CHROOT, MKNOD, AUDIT_WRITE, SETFCAP. Dropping them all means the process has zero special permissions.}}.
- `--security-opt=no-new-privileges` — prevents privilege escalation via setuid/setgid binaries. Even if the agent finds a SUID binary, it can't use it.
- `--memory=4g --cpus=2` — resource limits so the agent can't OOM the host or fork-bomb.
- `-v /path/to/project:/workspace:ro` — mount --only-- the directory you want the agent to work on, --read-only--.
- `-v /path/to/output:/output:rw` — separate writable mount for output. The agent writes here and nowhere else.

**Setup time: 5 minutes.** Copy the command, adjust the two volume paths, run it.

## When the agent needs internet

`--network=none` is the safest option, but many agent tasks require internet access (API calls, web browsing, fetching dependencies). The problem: Docker's default bridge network gives internet access --and-- LAN access. The agent can reach the internet but also scan every device on your home network.

The fix: a custom network with {{iptables|the Linux firewall. Rules that filter network traffic based on source, destination, port, and protocol. We use them to block traffic to private IP ranges while allowing everything else.}} rules that block LAN access:

```bash
# create a custom network
docker network create --driver bridge agent-net

# block all private IP ranges (your LAN) from containers on that network
iptables -I DOCKER-USER -s 172.18.0.0/16 -d 192.168.0.0/16 -j DROP
iptables -I DOCKER-USER -s 172.18.0.0/16 -d 10.0.0.0/8 -j DROP
iptables -I DOCKER-USER -s 172.18.0.0/16 -d 172.16.0.0/12 -j DROP

# run the agent on the custom network
docker run --rm -it \
  --network=agent-net \
  --read-only \
  --cap-drop=ALL \
  --security-opt=no-new-privileges \
  -v /path/to/project:/workspace:ro \
  -v /path/to/output:/output:rw \
  your-agent-image
```

The agent gets internet. It cannot see your NAS, your partner's laptop, or your smart home hub. The iptables rules need to survive reboots (use `iptables-save` or a systemd unit).

**Setup time: 30 minutes** to configure and test. A weekend if you want to be thorough about it.

## Docker networking modes at a glance

| Mode | Isolation | LAN access | Use for an agent? |
|---|---|---|---|
| `--network=none` | Total. Loopback only. | None | Best for offline tasks |
| `--network=bridge` (default) | Container gets private IP, NAT to host | --Yes-- — can scan your LAN | Dangerous without iptables |
| Custom bridge + iptables | Internet yes, LAN blocked | No | Best for online tasks |
| `--network=host` | None. Shares host's network stack. | Full | --Never-- use for untrusted agents |

## Beyond standard Docker: gVisor

Docker containers share the host's kernel. All 300+ Linux syscalls go directly to the host. A kernel exploit inside the container = root on the host. This has happened (CVE-2019-5736, Dirty COW).

Google's {{gVisor|an open-source container runtime that interposes a user-space kernel (called Sentry) between the container and the host. Instead of 300+ syscalls hitting the host kernel, gVisor intercepts them and re-implements ~200 of them in user space. Only ~60 vetted syscalls ever reach the real kernel.}} dramatically reduces this attack surface:

```bash
# install gVisor's runsc runtime, then:
docker run --runtime=runsc --rm -it \
  --network=none \
  -v /path/to/project:/workspace:ro \
  your-agent-image
```

There's a performance overhead (10-30% on I/O-heavy workloads) but the kernel attack surface drops from 300+ syscalls to ~60. Google uses it in production for GKE Sandbox.

**Setup time: 30 minutes.** Install `runsc`, configure Docker, add the flag.

---

# Option 2: Virtual machines

## When Docker isn't enough

Docker is a room inside your house — real walls, locked doors, but same foundation. A VM is --a separate house on a different street--. Separate kernel, separate memory, separate network. If an agent escapes a container, it owns your host. If it escapes a VM... it doesn't. VM escapes exist (Venom/CVE-2015-3456) but they're far rarer and far harder than kernel exploits.

| Property | Container | VM |
|---|---|---|
| Kernel | Shared with host | Separate guest kernel |
| Attack surface | ~300 syscalls exposed | ~30 hypercalls to hypervisor |
| Escape difficulty | Kernel exploit = game over | Need hypervisor exploit (much rarer) |
| Startup time | Milliseconds | Seconds (Firecracker: ~125ms) |
| Memory overhead | ~10 MB | 5 MB (Firecracker) to 256 MB (full) |

## macOS: OrbStack (5 minutes)

If you're on Apple Silicon, **OrbStack** is the path of least resistance. It runs a single, heavily optimized Linux VM on macOS using Virtualization.framework.

```bash
# install OrbStack, then:
orb create ubuntu agent-sandbox
orb shell agent-sandbox

# inside the VM — install what you need, run the agent
# your macOS home directory, SSH keys, browser profiles = invisible
```

I ran OpenClaw's core loop in an OrbStack instance for three days. The overhead was negligible — less than 0.1% background CPU, under 10 MB disk footprint. It felt like running a native process, except my host machine's credentials and files were completely invisible to it.

Docker containers inside OrbStack get an extra layer: a container escape compromises the OrbStack Linux VM, --not your Mac--. That's a fundamentally different threat level than Docker Desktop, where an escape lands you on macOS directly.

**Setup time: 5 minutes.** Install the app, create the VM, done.

## macOS: UTM (15 minutes)

For maximum isolation: **UTM** wraps QEMU with a macOS-native GUI. Full VM — its own kernel, its own disk image, its own network stack. Zero shared state with the host.

Heavier than OrbStack (~256 MB+ per VM), slower to create (you're installing an OS from an ISO), but the isolation is as real as it gets without a separate physical machine.

**Setup time: 15 minutes** for basic setup. Longer if you want a customized OS install.

## Linux: Firecracker (weekend project)

AWS's microVM runtime, built for Lambda and Fargate. Boots in ~125ms, <5 MiB memory overhead per VM. The companion "jailer" adds cgroups, seccomp, and chroot around the VMM itself — isolation around the isolation.

The tradeoff: no Docker-style UX. You write JSON configs and manage VM lifecycle via API. Linux-only, requires `/dev/kvm`.

**Setup time: a weekend.** Powerful, but not plug-and-play.

## Coming soon: Apple Containers

Apple announced native containerization at WWDC 2025 for macOS Tahoe. Each container runs in its own lightweight VM (not a shared kernel like Docker). Sub-second start times, dedicated IP per container, built on Virtualization.framework. Still in developer preview, but if you're on macOS 26, this may become the default answer.

---

# Option 3: Cloud deployment

## Why the cloud solves most of the problem

Here's the thing about running OpenClaw on a cloud server: --your files aren't there--. Your SSH keys, your browser sessions, your `.env` files, your messaging databases, your local network — none of it exists on the server. The agent has "full access" to... a clean Ubuntu box in a datacenter. That's a fundamentally different risk profile than a Mac Mini in your closet that also has your tax returns on it.

DigitalOcean published a deployment guide (by Amit Jotwani) that walks through the setup. Here's the security-relevant summary:

## The setup

```bash
# 1. Create a $12/month Droplet: Ubuntu 24.04, 2GB RAM, region near you

# 2. SSH in and create a dedicated user (don't run as root)
ssh root@YOUR_DROPLET_IP
adduser clawd && usermod -aG sudo clawd && su - clawd

# 3. Install OpenClaw
curl -fsSL https://clawd.bot/install.sh | bash
exec bash

# 4. Run the onboarding wizard with daemon mode
clawdbot onboard --install-daemon
# → configures your LLM provider (Anthropic, OpenAI, etc.)
# → links WhatsApp/Telegram/iMessage via QR code
# → installs a systemd service that runs 24/7
```

That's it. The gateway runs as a systemd service — survives SSH disconnects, reboots, everything. You chat through WhatsApp, the TUI (`clawdbot tui`), or a web dashboard (via SSH tunnel to `localhost:18789`).

{bkqt/tip|What the cloud gives you for free}
- **No local files at risk** — the droplet doesn't have your SSH keys, browser sessions, or personal documents
- **No LAN access** — the server is in a datacenter, not on your home network. Your NAS, cameras, and smart home are unreachable.
- **Easy to destroy** — if something goes wrong, delete the droplet. Your local machine is untouched.
- **Snapshots and backups** — DigitalOcean Snapshots or `scp` the `~/clawd/` directory for state backup
- **Firewall at the VPC level** — cloud firewalls are more capable than your home router
{/bkqt}

## The tradeoff

Cloud deployment has one meaningful downside: --your data leaves your network--. Every instruction you send passes through Anthropic's API (this is true for local deployments too, but the local machine can also process local files without sending them anywhere). If the agent needs to read a file, that file has to be on the server. You're trading local-file convenience for a dramatically better security boundary.

For most use cases — task management, email triage, web research, code generation, scheduling — the agent doesn't need your local files at all. For file-heavy workflows (organizing downloads, managing a photo library, processing local data), you'd need to sync specific directories to the server, which partially defeats the purpose.

{bkqt/note}
DigitalOcean's own documentation includes this line: "giving a third party agent framework access to your local machine introduces a lot of security risks, so use Moltbot at your own risk. It is highly recommended to deploy it on an isolated environment that does not contain sensitive or private data." They're telling you what the right answer is.
{/bkqt}

## Hardening the droplet

The base deployment works, but a few additions tighten it significantly:

```bash
# enable the firewall — allow only SSH
sudo ufw allow OpenSSH
sudo ufw enable

# restrict outbound too (optional, advanced)
# only allow traffic to Anthropic API + your messaging provider
sudo ufw default deny outgoing
sudo ufw allow out to any port 443  # HTTPS
sudo ufw allow out to any port 53   # DNS

# set up automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# monitor what the agent is doing
clawdbot logs --follow
```

And back up the agent's state (memory, identity, conversation history):

```bash
# from your local machine — weekly backup
scp -r clawd@YOUR_DROPLET_IP:~/clawd ~/clawdbot-backup-$(date +%Y%m%d)
```

---

# Network segmentation

If you're running the agent on a physical machine at home (not in the cloud, not in a container), network segmentation is what protects everything else on your LAN.

## Guest WiFi (5 minutes)

The simplest option. Almost every router has a guest network that isolates devices from the main LAN by default.

a. Open your router's admin panel (usually `192.168.1.1`)
b. Enable guest WiFi if it's not already on
c. Connect the agent's machine to the guest network

The agent gets internet access. It cannot see or reach any device on your main network. Done.

This isn't as robust as VLANs (no per-port control, no granular firewall rules, sometimes limited throughput), but it's a real improvement over a flat network where everything can talk to everything.

## VLANs (half a day to a weekend)

{{VLANs|802.1Q virtual LANs. They carve one physical network into multiple isolated virtual segments. Devices on VLAN 10 cannot talk to devices on VLAN 20 unless you create an explicit firewall rule allowing it.}} give you real network segmentation with firewall rules between zones.

A practical home layout:

- **VLAN 1 (default):** trusted devices — your daily laptop, your phone
- **VLAN 10 (lab):** the machine running the AI agent. Firewall: internet yes, LAN no.
- **VLAN 20 (IoT):** smart home devices. Internet yes, LAN no.
- **VLAN 30 (guest):** guest WiFi. Internet only.

| Router hardware | VLAN support | Setup effort | Price range |
|---|---|---|---|
| **Ubiquiti UniFi** | Full GUI, per-SSID VLAN assignment | Half a day | $100–$400 |
| **pfSense / OPNsense** | Full support, inter-VLAN firewall | Half a day | Free software + $100–$200 mini PC |
| **OpenWrt** | Full support (flash existing router) | Weekend | Free |
| **Most ISP routers** | No. Maybe guest WiFi. | N/A | Use guest WiFi instead |

---

# The credential audit

Do this regardless of which containment strategy you pick. 15 minutes that tells you exactly what's at risk.

```bash
# 1. SSH keys — are they passphrase-protected?
head -2 ~/.ssh/id_ed25519
# "ENCRYPTED" in the header = has passphrase
# no "ENCRYPTED" = plaintext key. fix:
ssh-keygen -p -f ~/.ssh/id_ed25519

# 2. Cloud credentials — do they exist?
ls -la ~/.aws/credentials ~/.kube/config ~/.docker/config.json 2>/dev/null
# if they exist, they're almost certainly plaintext

# 3. Git credential helper
git config --global credential.helper
# "store" = plaintext tokens in ~/.git-credentials
# fix: switch to "osxkeychain" (macOS) or "libsecret" (Linux)
git config --global credential.helper osxkeychain

# 4. .env files — how many are on this machine?
find ~ -name ".env" -type f 2>/dev/null | head -20
# each one is a plaintext file with production secrets

# 5. Browser cookies (Firefox — unencrypted)
find ~/Library -name "cookies.sqlite" 2>/dev/null   # macOS
find ~/.mozilla -name "cookies.sqlite" 2>/dev/null   # Linux

# 6. SSH agent — is it forwarding keys?
ssh-add -l
# if keys are listed, they're loaded in memory and available
# to any process running as your user
```

{bkqt/tip|Quick fixes}
- **Unencrypted SSH keys:** `ssh-keygen -p -f ~/.ssh/id_ed25519` — adds a passphrase. 30 seconds per key.
- **Git credential store:** `git config --global credential.helper osxkeychain` — switches from plaintext file to encrypted keychain.
- **Stale .env files:** move production `.env` files off any machine that runs an AI agent. Use a secrets manager (1Password CLI, Doppler, Vault) instead.
- **Firefox cookies:** consider using a separate browser profile for sensitive sessions (banking, email) and keeping the agent machine's browser clean.
{/bkqt}

---

# The effort-to-protection matrix

Every technique in this guide, ranked by effort and what it buys you. Start at the top and work down until the tradeoffs stop making sense for your situation.

| What you do | Effort | What it buys you |
|---|---|---|
| Guest WiFi for agent machine | 5 min | LAN isolation — agent can't reach your other devices |
| Docker `--network=none --cap-drop=ALL` | 5–10 min | Filesystem + network + capability isolation |
| OrbStack VM (macOS) | 5 min | Separate kernel — escapes stay inside the VM |
| Passphrase on SSH keys | 5 min/key | Blocks silent key theft |
| Cloud deployment (DigitalOcean) | 20 min | No local files, no LAN, easy to destroy |
| Credential audit (SSH, AWS, .env, git) | 15 min | Know exactly what's exposed |
| VLANs (UniFi / pfSense / OpenWrt) | Half a day | Firewall rules between network zones |
| Docker + iptables LAN blocking | Weekend | Internet for the agent, no LAN scanning |
| gVisor (`--runtime=runsc`) | 30 min | Kernel attack surface reduced from 300+ to ~60 syscalls |
| Full VM (UTM / Firecracker) | 15 min–weekend | Maximum isolation, separate everything |

{bkqt/warning|The 90% rule}
The first six rows take under an hour combined and cover ~90% of the attack surface. Everything below the line is real protection but diminishing returns. If you only do one thing, make it the first row: guest WiFi. If you do two things, add Docker. If you do three, add the credential audit.
{/bkqt}

The full thread — what "full access" means, why the supply chain matters, and what Moltbook tells us about where this is heading — is here: [OpenClaw and the keys to your kingdom](/blog/threads/openclaw-and-the-keys-to-your-kingdom).
