"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "@/utils/axios";
import { Loader2, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface CityData {
  city_id: number;
  city_name: string;
  zones: ZoneData[];
}

interface ZoneData {
  zone_id: number;
  zone_name: string;
}

interface Order {
  _id: string;
  orderId: string;
  name: string;
  phone: string;
  address: string;
  status: string;
  paymentStatus: string;
  subTotal: number;
  discount: number;
  charge: number;
  shiping: number;
  quantity: number;
  totalAmount: number;
  paidAmount: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
    role: string;
    profile_picture: string;
  };
  productId: {
    _id: string;
    title: string;
    description: string;
    price: number;
    offerPrice: number;
    coverPhoto: string;
    status: string;
    stock: string;
    slug: string;
  };
  paymentInfo: {
    transactionId: string;
    method: string;
    accountNumber: string;
    paymentDate: string;
    proofUrl: string;
  };
}

const formSchema = z.object({
  city: z.string().min(1, "City is required"),
  zone: z.string().min(1, "Zone is required"),
});

const AllOrder = () => {
  const [orders, setOrders] = useState<any>({ data: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);
  const [selectedOrderIdForCourier, setSelectedOrderIdForCourier] = useState<
    string | null
  >(null);
  const [cities, setCities] = useState<CityData[]>([]);
  const [selectedCityZones, setSelectedCityZones] = useState<ZoneData[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: "",
      zone: "",
    },
  });

  const fetchCitiesAndZones = async () => {
    try {
      const response = await axiosInstance.get("/courier/cities-zones");
      setCities(response.data.data);
    } catch (error) {
      console.error("Error fetching cities and zones:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch cities and zones",
      });
    }
  };

  useEffect(() => {
    fetchCitiesAndZones();
  }, []);

  const handleCityChange = (cityId: string) => {
    const selectedCity = cities.find(
      (city) => city.city_id === parseInt(cityId)
    );
    if (selectedCity) {
      setSelectedCityZones(selectedCity.zones);
      form.setValue("city", cityId);
      form.setValue("zone", "");
    }
  };

  const handleZoneChange = (zoneId: string) => {
    form.setValue("zone", zoneId);
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      let url = "/order-details";

      if (startDate && endDate) {
        url = `/order/stats?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await axiosInstance.get(url);
      if (startDate && endDate) {
        setOrders({ data: response.data?.data?.orders });
        setTotalOrders(response.data?.data?.total);
      } else {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch orders",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [startDate, endDate, toast]);

  const handleStatusUpdate = async (
    orderId: string,
    status: string,
    paymentStatus: string
  ) => {
    try {
      setProcessingId(orderId);
      await axiosInstance.patch(`/order-details/${orderId}`, {
        status,
        paymentStatus,
      });

      toast({
        title: "Success",
        description: "Order status updated successfully",
      });

      // Refresh orders after update
      const response = await axiosInstance.get("/order-details");
      setOrders(response.data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDateChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      if (endDate && value > endDate) {
        toast({
          variant: "destructive",
          title: "Invalid Date",
          description: "Start date cannot be greater than end date",
        });
        return;
      }
      setStartDate(value);
    } else {
      if (startDate && value < startDate) {
        toast({
          variant: "destructive",
          title: "Invalid Date",
          description: "End date cannot be less than start date",
        });
        return;
      }
      setEndDate(value);
    }
  };

  const handleSendToCourier = async (values: z.infer<typeof formSchema>) => {
    if (!selectedOrderIdForCourier) return;

    try {
      setProcessingId(selectedOrderIdForCourier);
      const selectedCity = cities.find(
        (city) => city.city_id.toString() === values.city
      );
      const selectedZone = selectedCity?.zones.find(
        (zone) => zone.zone_id.toString() === values.zone
      );

      if (!selectedCity || !selectedZone) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a valid city and zone.",
        });
        setProcessingId(null);
        return;
      }

      await axiosInstance.post(`/courier/pathao/${selectedOrderIdForCourier}`, {
        city: selectedCity.city_name,
        zone: selectedZone.zone_name,
      });
      toast({
        title: "Success",
        description: "Order sent to courier successfully",
      });
      setIsCourierModalOpen(false);
      form.reset();
      setSelectedCityZones([]); // Clear zones after successful submission
      // No need to refetch all orders, status update will be handled by courier system
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Failed to send to courier",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[16px] group-data-[sidebar-size=sm]:xl:ml-[16px] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-full">
          <div className="card overflow-hidden">
            <div className="bg-gradient-to-r from-primary/90 to-primary p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-black">
                All Orders
              </h1>
            </div>
          </div>

          <div className="card mt-6">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between gap-4">
                <div>
                  {startDate && endDate && <p>Total Orders: {totalOrders}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) =>
                          handleDateChange("start", e.target.value)
                        }
                        className="w-[200px] cursor-pointer"
                        onClick={(e) => e.currentTarget.showPicker()}
                        max={endDate || undefined}
                      />
                    </div>
                    <span>to</span>
                    <div className="relative">
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) =>
                          handleDateChange("end", e.target.value)
                        }
                        className="w-[200px] cursor-pointer"
                        onClick={(e) => e.currentTarget.showPicker()}
                        min={startDate || undefined}
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                  >
                    Clear Filter
                  </Button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    {/* <TableHead>Amount</TableHead> */}
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders?.data?.map((order: Order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-primary" />
                          {order.orderId ?? "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.name ?? "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.phone ?? "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.productId?.title ?? "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            ৳
                            {order.productId?.offerPrice?.toLocaleString() ??
                              "0"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{order.quantity ?? 0}</TableCell>
                      {/* <TableCell>
                        <div>
                          <div className="font-medium">
                            ৳{order.totalAmount?.toLocaleString() ?? "0"}
                          </div>
                          {order.discount > 0 && (
                            <div className="text-sm text-gray-500">
                              Discount: ৳{order.discount?.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </TableCell> */}
                      <TableCell>
                        <div className="space-y-1">
                          <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status ?? "N/A"}
                          </div>
                          <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            Payment: {order.paymentStatus ?? "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {order.paymentInfo?.method ?? "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.paymentInfo?.accountNumber ?? "N/A"}
                          </div>
                          {order.paymentInfo?.proofUrl && (
                            <a
                              href={order.paymentInfo.proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline"
                            >
                              View Proof
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.createdAt
                          ? moment(order.createdAt).format("MMM DD, YYYY HH:mm")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Select
                            defaultValue={order.status}
                            onValueChange={(value) =>
                              handleStatusUpdate(
                                order._id,
                                value,
                                order.paymentStatus
                              )
                            }
                            disabled={processingId === order._id}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Update Order Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Refunded">Refunded</SelectItem>
                              <SelectItem value="Courier">Courier</SelectItem>
                              <SelectItem value="Delivered">
                                Delivered
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Select
                            defaultValue={order.paymentStatus}
                            onValueChange={(value) =>
                              handleStatusUpdate(order._id, order.status, value)
                            }
                            disabled={processingId === order._id}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Update Payment Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Paid">Paid</SelectItem>
                            </SelectContent>
                          </Select>

                          <Dialog
                            open={
                              isCourierModalOpen &&
                              selectedOrderIdForCourier === order.orderId
                            }
                            onOpenChange={setIsCourierModalOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                className="w-full flex items-center justify-start"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrderIdForCourier(order.orderId);
                                  setIsCourierModalOpen(true);
                                  form.reset();
                                }}
                                disabled={processingId === order.orderId}
                              >
                                Send to Courier
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Send Order to Courier</DialogTitle>
                              </DialogHeader>
                              <form
                                onSubmit={form.handleSubmit((values) =>
                                  handleSendToCourier(values)
                                )}
                                className="space-y-4"
                              >
                                <div>
                                  <Label htmlFor="city">City</Label>
                                  <Select
                                    onValueChange={handleCityChange}
                                    value={form.watch("city")}
                                    disabled={form.formState.isSubmitting}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {cities.map((city) => (
                                        <SelectItem
                                          key={city.city_id}
                                          value={city.city_id.toString()}
                                        >
                                          {city.city_name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {form.formState.errors.city && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {form.formState.errors.city.message}
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <Label htmlFor="zone">Zone</Label>
                                  <Select
                                    onValueChange={handleZoneChange}
                                    value={form.watch("zone")}
                                    disabled={
                                      !form.watch("city") ||
                                      form.formState.isSubmitting
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a zone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {selectedCityZones.map((zone) => (
                                        <SelectItem
                                          key={zone.zone_id}
                                          value={zone.zone_id.toString()}
                                        >
                                          {zone.zone_name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {form.formState.errors.zone && (
                                    <p className="text-red-500 text-sm mt-1">
                                      {form.formState.errors.zone.message}
                                    </p>
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button
                                    type="submit"
                                    disabled={
                                      processingId === order.orderId ||
                                      form.formState.isSubmitting
                                    }
                                  >
                                    {form.formState.isSubmitting
                                      ? "Sending..."
                                      : "Send"}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>

                          {processingId === order.orderId && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Updating...
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllOrder;
