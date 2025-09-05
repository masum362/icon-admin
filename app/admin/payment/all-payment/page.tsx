"use client";

import React from "react";
import { usePaymentList } from "@/utils/apis/getPayment";
import Image from "next/image";

const PaymentList = () => {
  const { data: payments, isLoading } = usePaymentList(10, 1);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="card p-0 lg:min-h-[calc(100vh_-_theme('spacing.header')_*_1.4)] xl:min-h-[calc(100vh_-_theme('spacing.header')_*_1.6)]">
        <div className="flex flex-col gap-2 sm:flex-center-between sm:flex-row px-4 py-5 sm:p-7 bg-gray-200/30 dark:bg-dark-card-shade">
          <div>
            <h6 className="card-title">Payment list</h6>
            <p className="card-description">All Payments Here</p>
          </div>
        </div>
        {/* Start All Payment List Table */}
        <div className="p-3 sm:p-4">
          <div className="overflow-x-auto scrollbar-table">
            <table className="table-auto border-collapse w-full whitespace-nowrap text-left text-gray-500 dark:text-dark-text font-medium">
              <thead>
                <tr className="text-primary-500">
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Transaction ID
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Purchase ID
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Student ID
                  </th>
                  {/* <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Amount
                  </th> */}
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Payment Method
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Account Number
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Payment Date
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Proof
                  </th>
                  <th className="px-4 py-4 bg-[#F2F4F9] dark:bg-dark-card-two first:rounded-l-lg last:rounded-r-lg dk-theme-card-square">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {payments?.data?.map((payment: any) => (
                  <tr key={payment._id}>
                    <td className="px-4 py-4">
                      <div>
                        <h6 className="leading-none text-heading font-semibold">
                          {payment.paymentInfo?.transactionId}
                        </h6>
                      </div>
                    </td>
                    <td className="px-4 py-4">{payment.purchaseId}</td>
                    <td className="px-4 py-4">{payment.studentId}</td>
                    {/* <td className="px-4 py-4">
                      <span className="font-semibold">৳{payment.paidAmount}</span>
                    </td> */}
                    <td className="px-4 py-4">
                      <div>
                        <span className="font-medium">
                          {payment.paymentInfo?.method}
                        </span>
                        <p className="text-sm text-gray-500">
                          {payment.paymentInfo?.paymentMedium}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {payment.paymentInfo?.accountNumber}
                    </td>
                    <td className="px-4 py-4">
                      {new Date(
                        payment.paymentInfo?.paymentDate
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      {payment.paymentInfo?.proofUrl && (
                        <a
                          href={payment.paymentInfo.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-500 hover:text-primary-600"
                        >
                          View Proof
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          payment.isDeleted
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {payment.isDeleted ? "Deleted" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* End All Payment List Table */}
      </div>
    </div>
  );
};

export default PaymentList;
