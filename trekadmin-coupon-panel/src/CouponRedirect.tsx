import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CouponDetailView from './components/CouponDetailView';
import { Coupon, Redemption, WithdrawalRequest } from './types';

/* ============================
   PROPS
============================ */
interface CouponRedirectProps {
  coupons: Coupon[];
  redemptions: Redemption[];
}

/* ============================
   LOAD ADMIN PAYOUT DATA
   (SINGLE SOURCE OF TRUTH)
============================ */
const loadWithdrawalRequests = (): WithdrawalRequest[] => {
  try {
    return JSON.parse(
      localStorage.getItem('ADMIN_WITHDRAWAL_REQUESTS') || '[]'
    );
  } catch {
    return [];
  }
};

const CouponRedirect: React.FC<CouponRedirectProps> = ({
  coupons,
  redemptions
}) => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  /* ============================
     FIND COUPON
  ============================ */
  const coupon = useMemo(() => {
    if (!code) return undefined;
    return coupons.find(
      c => c.code.toUpperCase() === code.toUpperCase()
    );
  }, [code, coupons]);

  /* ============================
     INVALID LINK HANDLING
  ============================ */
  if (!coupon || coupon.scope !== 'INFLUENCER') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900">
            Invalid Influencer Link
          </h1>
          <p className="text-gray-500 mt-2">
            This influencer coupon does not exist or is inactive.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  /* ============================
     FILTER REDEMPTIONS
  ============================ */
  const influencerRedemptions = useMemo(() => {
    return redemptions.filter(
      r => r.couponCode.toUpperCase() === coupon.code.toUpperCase()
    );
  }, [redemptions, coupon.code]);

  /* ============================
     LOAD PAYOUT DATA (ADMIN)
  ============================ */
  const withdrawalRequests = useMemo(
    () => loadWithdrawalRequests(),
    []
  );

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        <CouponDetailView
          coupon={coupon}
          allRedemptions={influencerRedemptions}

          /* 🔓 PUBLIC MODE */
          publicView={true}

          /* 🔥 SHARED PAYOUT STATE */
          withdrawalRequests={withdrawalRequests}

          onBack={() => navigate('/')}
        />
      </div>
    </div>
  );
};

export default CouponRedirect;
