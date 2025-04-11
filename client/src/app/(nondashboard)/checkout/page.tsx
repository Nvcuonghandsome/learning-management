'use client';

import Loading from '@/components/Loading';
import WizardStepper from '@/components/WizardStepper';
import { useCheckoutNavigation } from '@/hooks/useCheckoutNavigation';
import { useUser } from '@clerk/nextjs';
import CheckoutDetailsPage from './details';

const CheckoutWizard = () => {
  const { isLoaded } = useUser();
  const { checkoutStep } = useCheckoutNavigation();

  if (!isLoaded) return <Loading />;

  const renderStep = () => {
    switch (checkoutStep) {
      case 1:
        // http://localhost:3000/checkout?step=1&id=d3abbb57-3abc-472d-a7e4-493492814c79&showSignUp=false
        return <CheckoutDetailsPage />;
      case 2:
        return 'payment page';
      case 3:
        return 'completion page';
      default:
        return 'checkout detail page';
    }
  };

  return (
    <div className="checkout">
      <WizardStepper currentStep={checkoutStep} />
      <div className="checkout__content">{renderStep()}</div>
    </div>
  );
};

export default CheckoutWizard;
