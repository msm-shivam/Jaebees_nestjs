import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';

  const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const url = new URL(`${backendBase}/catalog/categories`);
  url.searchParams.set('page', page);
  url.searchParams.set('limit', limit);
  if (search) url.searchParams.set('search', search);
  if (status) url.searchParams.set('status', status);

  const res = await fetch(url.toString());
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
