import React, { useEffect, useState } from 'react';
import {
  Appearance,
  loadStripe,
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCreatePaymentIntentMutation } from '@/state/api';
import { useCurrentCourse } from '@/hooks/useCurrentCourse';
import Loading from '@/components/Loading';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const appearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#0570de',
    colorBackground: '#18181b',
    colorText: '#d2d2d2',
    colorDanger: '#df1b41',
    colorTextPlaceholder: '#6e6e6e',
    fontFamily: 'Inter, system-ui, sans-serif',
    spacingUnit: '3px',
    borderRadius: '10px',
    fontSizeBase: '14px',
  },
};

const StripeProvider = ({ children }: { children: React.ReactNode }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const { course } = useCurrentCourse();

  useEffect(() => {
    if (!course?.price) return;

    const fetchPaymentIntent = async () => {
      const result = await createPaymentIntent({
        amount: course.price || 0,
      }).unwrap();

      setClientSecret(result.clientSecret);
    };

    fetchPaymentIntent();
  }, [course?.price]);

  const options: StripeElementsOptions = {
    clientSecret,
    appearance,
    locale: 'en',
  };

  if (!clientSecret) return <Loading />;

  return (
    <Elements stripe={stripePromise} options={options} key={clientSecret}>
      {children}
    </Elements>
  );
};

export default StripeProvider;
