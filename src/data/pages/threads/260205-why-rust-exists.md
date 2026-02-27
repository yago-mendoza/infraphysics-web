---
id: why-rust-exists
title: why-rust-exists
displayTitle: why rust exists
category: threads
date: 2026-02-05
thumbnail: https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=400&auto=format&fit=crop
description: ownership, borrowing, and the compiler that won't let you hurt yourself.
lead: "Every language makes trade-offs. Rust made one that sounds insane until you understand what it prevents."
tags: [rust, systems-programming, memory-safety, languages]
featured: false
---

# why rust exists

the first time i tried to write Rust, the compiler rejected my code fourteen times in twenty minutes. not for logic errors. not for typos. for *ownership violations*.

i didn't know what an ownership violation was. i didn't know i was violating anything. i just wanted to pass a string to a function and then use it again afterwards. apparently, in Rust, that's a *crime*.

i closed the editor. i went for a walk. i came back three days later and tried again.

that was roughly the start of one of the most rewarding — and most infuriating — learning experiences i've had as a programmer. and to understand *why* Rust works the way it does, you need to understand the problem it was built to solve. because it's a big one. a really, really expensive one.

## the billion-dollar graveyard

here's a fun fact that isn't fun at all: --roughly 70% of all security vulnerabilities in large C and C++ codebases are memory safety bugs.-- not "roughly" as in "we think, maybe." roughly as in Microsoft, Google, and Apple have independently published reports confirming exactly this number. seventy percent. seven out of ten.

what does "memory safety bug" mean? it means the program tried to use memory it shouldn't have. it read from a place that had already been freed. it wrote past the end of a buffer. it dereferenced a pointer that pointed to nothing. it handed out two mutable references to the same data and then watched in horror as they stomped on each other.

{bkqt/danger}
buffer overflows — a single category of memory bug — have been the root cause of some of the most devastating security breaches in computing history. Heartbleed (2014), WannaCry (2017), and countless others trace back to C code that read or wrote a few bytes past where it should have. billions of dollars. millions of compromised systems. all because a program counted wrong.
{/bkqt}

these aren't rare edge cases. they are the --default failure mode-- of systems programming in C and C++. if you write enough C, you *will* introduce memory bugs. not because you're bad at your job, but because the language gives you a loaded gun, removes the safety, and says "try not to point it at your foot." the human brain is simply not good enough to manually track every allocation, every free, every pointer, every lifetime, across a codebase of any meaningful size.

so for decades, the industry had two options. and they both sucked.

## the two bad options

**option one: garbage collection.**

languages like Java, Python, Go, and C# said: "okay, clearly humans can't be trusted with memory. so we'll handle it for you." a background process — the garbage collector — periodically scans the heap, finds objects nobody's using anymore, and frees them automatically. problem solved.

except... not really. garbage collectors introduce latency spikes. they consume memory overhead (sometimes substantial). they make performance unpredictable — your program might pause for 50 milliseconds at any moment while the GC does its thing. for a web server, that's usually fine. for a game engine running at 60fps, that's a dropped frame. for an embedded system in a pacemaker, that's potentially fatal.

{bkqt/note}
garbage collection is the right trade-off for most software. if you're writing a CRUD app, an API server, a data pipeline, a mobile app — GC languages are great. the performance tax is small and the productivity gain is enormous. the problem is that some software can't afford the tax at all.
{/bkqt}

**option two: manual memory management.**

C and C++ said: "you're the programmer. you know when memory should be allocated and freed. do it yourself." this gives you total control and zero overhead. it also gives you use-after-free, double-free, dangling pointers, buffer overflows, data races, and an entire zoo of bugs that have collectively cost the industry more money than most countries' GDP.

so that's the landscape. you get safety but lose control, or you get control but lose safety.

for forty years, everyone assumed those were the only two options.

## the third door

in 2006, Graydon Hoare — a Mozilla engineer — started working on a side project. he was tired of the C++ bugs in Firefox. specifically, he was tired of the *same categories* of C++ bugs showing up over and over, despite smart people trying hard to avoid them. so he started designing a language where those bugs would be *structurally impossible*.

not caught at runtime. not caught by a linter. not caught by code review. --impossible to express in the first place.--

that language became Rust. and its core innovation is a concept called ownership.

## three rules that change everything

Rust's ownership system is built on three rules. that's it. three rules. they sound almost trivially simple. they have consequences that will break your brain.

{bkqt/keyconcept|Rule 1}
every value in Rust has exactly one owner. when the owner goes out of scope, the value is dropped (freed). no garbage collector. no manual `free()`. the compiler inserts the cleanup code for you, at compile time, in exactly the right place.
{/bkqt}

{bkqt/keyconcept|Rule 2}
ownership can be *moved* from one variable to another. but once it moves, the original variable is dead. you cannot use it. the compiler will reject any attempt to touch it. this is what caught me on day one — i passed a string to a function, which *moved* ownership into that function, and then tried to use the string afterwards. Rust said no. the string was gone.
{/bkqt}

{bkqt/keyconcept|Rule 3}
if you don't want to move ownership, you can *borrow* a value. a borrow is a reference — a pointer that doesn't own the data. Rust enforces one ironclad constraint: you can have either one mutable reference or any number of immutable references, but never both at the same time. this single rule eliminates data races at compile time.
{/bkqt}

that's the entire memory model. three rules. no garbage collector. no manual memory management. the compiler enforces safety, and the generated code is as fast as C.

it sounds too good to be true. the catch is that learning to work within these rules feels, at first, like writing code in a straitjacket.

## the borrow checker experience

the borrow checker is the part of the Rust compiler that enforces the ownership rules. it is, simultaneously, the most hated and most loved feature of the language.

when you're new to Rust, the borrow checker is your enemy. you write perfectly reasonable-looking code. the compiler rejects it. you restructure. rejected again. you google the error message. you read a blog post. you restructure again. rejected *again*. you start questioning your career choices.

```rust
fn main() {
    let mut data = vec![1, 2, 3];
    let first = &data[0];     // immutable borrow
    data.push(4);             // mutable borrow — REJECTED
    println!("{}", first);
}
```

this code looks fine. you took a reference to the first element, then pushed a new element. what's the problem?

the problem is that `push` might reallocate the vector's internal buffer. if it does, `first` is now pointing at freed memory. in C++, this compiles silently and produces a use-after-free bug that might crash your program three weeks later in production at 2am on a Sunday. in Rust, the compiler catches it *before your code ever runs*.

{bkqt/tip}
the borrow checker isn't fighting you. it's showing you bugs you didn't know you were about to write. every time the compiler says "no," it's preventing a bug that would have existed in C++ or C. the shift in perspective — from "the compiler is blocking me" to "the compiler is protecting me" — is the moment Rust clicks.
{/bkqt}

after a few weeks (or months, depending on your background), something changes. the borrow checker stops feeling like an obstacle. it starts feeling like a superpower. you realize that if your code compiles, an entire *category* of bugs simply cannot exist in it. no use-after-free. no data races. no null pointer dereferences. no double frees. gone. structurally impossible.

the confidence this gives you is hard to overstate. you can refactor aggressively. you can write concurrent code without fear. you can hand your codebase to someone else and know that the compiler will catch their memory mistakes just like it caught yours.

## beyond memory: the things nobody told me

ownership is the headline feature, but Rust has a bunch of other design choices that are quietly excellent.

**no null.** there is no `null` in Rust. instead, you have `Option<T>` — a type that is either `Some(value)` or `None`. the compiler *forces* you to handle the `None` case. you cannot forget. this eliminates null pointer exceptions — what Tony Hoare (the inventor of null) called his "billion-dollar mistake."

```rust
fn find_user(id: u32) -> Option<User> {
    // returns Some(user) or None
}

// the compiler forces you to handle both cases
match find_user(42) {
    Some(user) => println!("found: {}", user.name),
    None => println!("user not found"),
}
```

**no exceptions.** Rust doesn't have try/catch. errors are values — specifically, `Result<T, E>`, which is either `Ok(value)` or `Err(error)`. you handle errors explicitly, in the type system, at every call site. the `?` operator makes this ergonomic:

```rust
fn read_config() -> Result<Config, io::Error> {
    let contents = fs::read_to_string("config.toml")?;  // ? propagates errors
    let config = parse_toml(&contents)?;
    Ok(config)
}
```

**pattern matching.** Rust's `match` is exhaustive — the compiler verifies you've handled every possible case. combined with enums that can carry data (algebraic data types), this is absurdly powerful:

```rust
enum Shape {
    Circle(f64),           // radius
    Rectangle(f64, f64),   // width, height
    Triangle(f64, f64, f64), // three sides
}

fn area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle(r) => std::f64::consts::PI * r * r,
        Shape::Rectangle(w, h) => w * h,
        Shape::Triangle(a, b, c) => {
            let s = (a + b + c) / 2.0;
            (s * (s - a) * (s - b) * (s - c)).sqrt()
        }
    }
    // add a new variant to Shape? compiler error until you handle it here.
}
```

**zero-cost abstractions.** iterators, closures, generics, trait objects — they all compile down to the same machine code you'd write by hand in C. "zero-cost" means you pay no runtime overhead for using high-level constructs. the compiler optimizes them away completely.

## who's using it and why

Rust isn't a toy language or an academic experiment. it's in production at:

- **Mozilla** — parts of Firefox's rendering engine (Servo/Stylo)
- **Amazon** — Firecracker (the VM that powers Lambda and Fargate)
- **Microsoft** — rewriting core Windows components from C++
- **Google** — Android's bluetooth stack, parts of Fuchsia
- **Cloudflare** — Pingora, their HTTP proxy that handles a significant chunk of internet traffic
- **Discord** — rewrote their read states service from Go to Rust for predictable latency
- **Linux kernel** — Rust is now an officially supported language for kernel modules (this is a *massive* endorsement)

the pattern is consistent: organizations that need C-level performance with fewer bugs are reaching for Rust. not instead of Python or JavaScript — instead of C and C++.

## the pain is the point

here's what took me the longest to understand about Rust.

the difficulty isn't a design flaw. it's not that Graydon Hoare and the Rust team couldn't figure out how to make the language easier. it's that --the difficulty is the language telling you something true about your problem.--

when the borrow checker rejects your code, it's not being pedantic. it's revealing a genuine tension in your design — two parts of your program want conflicting access to the same data, and you haven't resolved that conflict. in other languages, this conflict still exists. you just don't see it until production.

Rust makes the implicit explicit. it forces you to think about ownership, lifetimes, and data flow *up front*, at design time, rather than discovering those issues later as bugs. it's the programming language equivalent of "measure twice, cut once" — except the ruler screams at you if you try to cut without measuring.

{bkqt/note}
Rust is not the right tool for every job. if you're prototyping, if latency doesn't matter, if your team doesn't have time for the learning curve — use Python, use Go, use TypeScript. Rust's value proposition is specific: maximum performance with maximum safety, at the cost of initial development speed. know when that trade-off makes sense.
{/bkqt}

---

i still get rejected by the borrow checker. regularly. the difference is that now, when it says no, my first instinct isn't frustration — it's curiosity. *what am i not seeing?* what conflict exists in my design that i haven't noticed yet?

the compiler knows. it always knows. and slowly, painfully, beautifully — it teaches you to see it too.
