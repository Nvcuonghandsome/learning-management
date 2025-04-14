'use client';

import Loading from '@/components/Loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatPrice } from '@/lib/utils';
import { useGetTransactionListQuery } from '@/state/api';
import { useUser } from '@clerk/nextjs';
import { SelectValue } from '@radix-ui/react-select';
import { useState } from 'react';

const Billing = () => {
  const [paymentType, setPaymentType] = useState('all');
  const { user, isLoaded } = useUser();

  const {
    data: transactions,
    isLoading,
    isError,
  } = useGetTransactionListQuery(user?.id || '', {
    skip: !isLoaded || !user,
  });

  if (isLoading || !isLoaded) return <Loading />;
  if (!user) return <div>Please login to view your billing information</div>;
  if (isError) return <div>Get transaction list error!</div>;

  const filteredData =
    transactions?.filter((transaction) => {
      return (
        paymentType === 'all' || transaction.paymentProvider === paymentType
      );
    }) || [];

  return (
    <div className="billing">
      <div className="billing__container">
        <h2 className="billing__title">Payment History</h2>
        <div className="billing__filters">
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger className="billing__select">
              <SelectValue placeholder="Payment Type" />
            </SelectTrigger>

            <SelectContent className="billing__select-content">
              <SelectItem className="billing__select-item" value="all">
                All Types
              </SelectItem>
              <SelectItem className="billing__select-item" value="stripe">
                Stripe
              </SelectItem>
              <SelectItem className="billing__select-item" value="paypal">
                Paypal
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="billing__grid">
          <Table className="billing__table">
            <TableHeader className="billing_table-header">
              <TableRow className="billing_table-header-row">
                <TableHead className="billing__table-cell">Date</TableHead>
                <TableHead className="billing__table-cell">Amount</TableHead>
                <TableHead className="billing__table-cell">
                  Payment Method
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="billing_table-body">
              {filteredData?.length > 0 ? (
                filteredData.map((transaction) => (
                  <TableRow
                    key={transaction.courseId}
                    className="billing_table-header-row"
                  >
                    <TableCell className="billing__table-cell">
                      {new Date(transaction.dateTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="billing__table-cell billing__amount">
                      {formatPrice(transaction.amount)}
                    </TableCell>
                    <TableCell className="billing__table-cell">
                      {transaction.paymentProvider}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="billing__table-row">
                  <TableCell
                    className="billing__table-sell text-center"
                    colSpan={3}
                  >
                    No transactions to display
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Billing;
