// app/api/season/current/route.ts
import { NextResponse } from 'next/server';
import { getCurrentSeason } from '@/app/lib/season';

export async function GET() {
  try {
    const season = await getCurrentSeason();
    return NextResponse.json(season);
  } catch (err) {
    console.error('Error fetching current season:', err);
    return NextResponse.json(
      { error: 'Failed to fetch current season' },
      { status: 500 }
    );
  }
}