/**
 * Marketplace API Endpoints
 *
 * Public interface for listing, verifying, and registering modules.
 * Allows external developers to sell verified modules.
 */

import { NextRequest, NextResponse } from 'next/server';
import { MODULE_REGISTRY } from '@/lib/module-registry';

// GET /api/marketplace - List all modules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const verified = searchParams.get('verified');
    const tier = searchParams.get('tier');

    let modules = Object.values(MODULE_REGISTRY);

    // Filter by verified status
    if (verified === 'true') {
      modules = modules.filter(m => m.marketplaceVerified);
    }

    // Filter by tier
    if (tier) {
      const tierLimits: Record<string, number> = {
        starter: 0,
        pro: 3,
        scale: 10,
      };
      const limit = tierLimits[tier] || 0;
      modules = modules.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      modules: modules.map(m => ({
        moduleId: m.moduleId,
        name: m.name,
        description: m.description,
        price: m.price,
        priceDisplay: `$${(m.price / 100).toFixed(0)}/month`,
        limits: m.limits,
        verified: m.marketplaceVerified,
      })),
      total: modules.length,
    });
  } catch (error) {
    console.error('Error fetching marketplace modules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

// POST /api/marketplace/register - Register new module (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { moduleId, name, description, price, limits, permissions, verified } = body;

    // TODO: Add admin authentication check
    // TODO: Validate module data
    // TODO: Store in database
    // TODO: Verify external module source

    return NextResponse.json({
      success: true,
      message: 'Module registered successfully',
      module: {
        moduleId,
        name,
        description,
        price,
        verified,
      },
    });
  } catch (error) {
    console.error('Error registering module:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to register module' },
      { status: 500 }
    );
  }
}
