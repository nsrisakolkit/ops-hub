import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to login page - you could add auth check here
  redirect('/login');
}
