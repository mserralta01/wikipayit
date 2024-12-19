import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        message: 'API key is required'
      }, { status: 400 });
    }

    // Test the API key with a simple geocoding request
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${apiKey}`,
      { method: 'GET' }
    );

    // Check for specific Mapbox error responses
    if (response.status === 401) {
      return NextResponse.json({
        success: false,
        message: 'Invalid Mapbox API key'
      });
    }

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: 'Failed to validate Mapbox API key',
        error: `HTTP ${response.status}`
      });
    }

    return NextResponse.json({
      success: true,
      message: 'API key is valid'
    });

  } catch (error) {
    console.error('Error validating Mapbox key:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error validating API key',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 