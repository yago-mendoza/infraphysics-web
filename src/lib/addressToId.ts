// Shared normalization: convert a wiki-link address to the concept's post ID

export function addressToId(address: string): string {
  return address.toLowerCase().replace(/\/\//g, '--').replace(/\s+/g, '-');
}
