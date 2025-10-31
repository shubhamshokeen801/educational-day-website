// app/events/[id]/register/page.tsx
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';
import RegisterFormClient from './RegisterFormClient';

export default async function RegisterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // unwrap the promise

  const supabase = await createServerClientInstance();
  const { data: event, error } = await supabase.from('events').select('*').eq('id', id).single();

  if (error || !event) {
    console.error('Error loading event:', error);
    return <div>Event not found</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">{event.name}</h2>
      <p>{event.description}</p>
      <RegisterFormClient event={event} />
    </div>
  );
}
