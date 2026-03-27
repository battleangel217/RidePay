import client from "./client";

export const approveRider = (rider_id: string, action: "approve" | "suspend") =>
  client.post(`/api/transactions/admin/approve-rider/${rider_id}/`, { action });

export const setFare = (amount: number) =>
  client.post("/api/transactions/admin/set-fare/", { amount });

export const updatePlateNumber = (plate_number: string) =>
  client.put("/api/users/plate-number/", { plate_number });
