import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Family from '@/lib/models/Family';
import { logActionFromRequest, AuditActions } from '@/lib/audit';
import { parseDeviceInfo, formatDeviceInfo } from '@/lib/device-info';

// Mark route as dynamic since it uses authentication and database
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, { user }: { user: any }) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get('search') || '';

      const query: any = {};
      if (search) {
        query.familyName = { $regex: search, $options: 'i' };
      }

      const families = await Family.find(query)
        .populate({
          path: 'headOfFamily',
          select: 'fullName phone email',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'members',
          select: 'fullName phone email membershipStatus relationship',
          options: { strictPopulate: false }
        })
        .sort({ createdAt: -1 })
        .lean();

      // Filter out any null references and ensure familyName exists
      const sanitizedFamilies = families.map((family: any) => {
        // If headOfFamily is null or deleted, we need to handle it
        if (!family.headOfFamily && family.headOfFamily !== null) {
          // Head of family was deleted, try to get first member as head
          if (family.members && family.members.length > 0) {
            family.headOfFamily = family.members[0];
          }
        }

        // Filter out null members
        if (family.members) {
          family.members = family.members.filter((m: any) => m !== null);
        }

        // Ensure familyName always exists
        if (!family.familyName) {
          // Try to generate from head of family name
          if (family.headOfFamily && family.headOfFamily.fullName) {
            family.familyName = `${family.headOfFamily.fullName} Family`;
          } else if (family.members && family.members.length > 0 && family.members[0].fullName) {
            family.familyName = `${family.members[0].fullName} Family`;
          } else {
            family.familyName = 'Unnamed Family';
          }
        }

        return family;
      });

      // Log view action
      const userAgent = req.headers.get('user-agent') || undefined;
      const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined;
      const deviceInfo = parseDeviceInfo(userAgent);
      
      await logActionFromRequest(
        user,
        AuditActions.VIEW_FAMILIES,
        'Family',
        {
          details: {
            searchQuery: search || null,
            resultCount: sanitizedFamilies.length,
          },
          ipAddress,
          userAgent,
          deviceType: deviceInfo.deviceType,
          deviceName: deviceInfo.deviceName,
          browser: deviceInfo.browser,
          browserVersion: deviceInfo.browserVersion,
          os: deviceInfo.os,
          osVersion: deviceInfo.osVersion,
          deviceInfo: formatDeviceInfo(deviceInfo),
        }
      );
      
      return NextResponse.json({ families: sanitizedFamilies });
    } catch (error: any) {
      console.error('Error fetching families:', error);
      console.error('Error stack:', error.stack);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch families', details: error.toString() },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export const GET = requireAuth(handler);

