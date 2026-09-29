// app/api/profile/update-phone/route.ts
import { NextResponse } from 'next/server';
import { createServerClientInstance } from '@/app/lib/supabaseServerClient';

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();
    const supabase = await createServerClientInstance();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data, error } = await supabase.rpc('update_my_phone', { new_phone: phoneNumber });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Update phone error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}