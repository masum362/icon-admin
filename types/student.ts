export interface UserId {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  profile_picture: string;
  status: string;
  isDeleted: boolean;
  pin: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Student {
  _id: string;
  role: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  gurdianName: string;
  gurdianPhone: string;
  profile_picture: string;
  address: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  userId: UserId;
}
