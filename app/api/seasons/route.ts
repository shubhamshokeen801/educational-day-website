// app/api/seasons/route.ts
import { NextResponse } from 'next/server';
import { getAllSeasons } from '@/app/lib/season';

export async function GET() {
  try {
    const seasons = await getAllSeasons();
    return NextResponse.json(seasons);
  } catch (err) {
    console.error('Error fetching seasons:', err);
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
      { status: 500 }
    );
  }
}