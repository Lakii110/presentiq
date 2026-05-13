// Debug helper to check environment variables
export function debugEnv() {
  console.log('=== Environment Debug ===');
  console.log('process.env.NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('All NEXT_PUBLIC vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC')));
  console.log('========================');
}
