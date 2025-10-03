// hooks/useFlashToast.js
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

export const useFlashToast = () => {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash.success) {
            if (flash.transaction) {
                // Show toast dengan transaction details
                toast.success(flash.success, {
                    description: `Transaction ID: ${flash.transaction.id}`,
                    duration: 5000,
                    action: {
                        label: 'View Details',
                        onClick: () => showTransactionDetails(flash.transaction)
                    }
                });
            } else {
                // Show regular success toast
                toast.success(flash.success);
            }
        }

        if (flash.error) {
            toast.error(flash.error);
        }

        if (flash.warning) {
            toast.warning(flash.warning);
        }

        if (flash.info) {
            toast.info(flash.info);
        }
    }, [flash]);
};

// Function untuk show transaction details
const showTransactionDetails = (transaction) => {
    toast.info(
        <div className="space-y-2">
            <h4 className="font-semibold">Transaction Details</h4>
            <div className="text-sm space-y-1">
                <p><strong>ID:</strong> {transaction.id}</p>
                <p><strong>Date:</strong> {transaction.date}</p>
                <p><strong>Customer:</strong> {transaction.customer.name}</p>
                <p><strong>Phone:</strong> {transaction.customer.phone}</p>
                <p><strong>Subtotal:</strong> ${transaction.subtotal.toFixed(2)}</p>
                <p><strong>Discount:</strong> ${transaction.discount.toFixed(2)}</p>
                <p><strong>Total:</strong> ${transaction.total.toFixed(2)}</p>
                <p><strong>Cashier:</strong> {transaction.cashier}</p>

                <div className="mt-2">
                    <strong>Items:</strong>
                    <div className="mt-1 space-y-1">
                        {transaction.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-xs">
                                <span>{item.name} (x{item.quantity})</span>
                                <span>${item.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>,
        {
            duration: 10000,
            closeButton: true
        }
    );
};
