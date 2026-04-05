import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Location {
    latitude: number;
    longitude: number;
}
export interface OrderInternal {
    id: OrderId;
    customerName: string;
    status: OrderStatus;
    deliveryFee: number;
    customerPhone: string;
    pickupAddress: string;
    assignedDeliveryBoy?: Principal;
    distanceKm: number;
    dropoffAddress: string;
    createdTimestamp: bigint;
}
export interface T {
    name: string;
    isOnline: boolean;
    phoneNumber: string;
    location: {
        latitude: number;
        longitude: number;
    };
}
export interface UserProfile {
    name: string;
    isOnline: boolean;
    phoneNumber: string;
    location: {
        latitude: number;
        longitude: number;
    };
}
export type OrderId = bigint;
export enum OrderStatus {
    new_ = "new",
    completed = "completed",
    ongoing = "ongoing",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptOrder(orderId: OrderId): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeOrder(orderId: OrderId): Promise<void>;
    createOrder(order: OrderInternal): Promise<OrderId>;
    createSampleOrders(): Promise<void>;
    getAllDeliveryBoys(): Promise<Array<T>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDeliveryBoyEarnings(deliveryBoy: Principal): Promise<number>;
    getDeliveryHistory(deliveryBoy: Principal): Promise<Array<OrderInternal>>;
    getOrder(orderId: OrderId): Promise<OrderInternal>;
    getOrdersByStatus(status: OrderStatus): Promise<Array<OrderInternal>>;
    getOrdersForDeliveryBoy(deliveryBoy: Principal): Promise<Array<OrderInternal>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    rejectOrder(orderId: OrderId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchOrdersByCustomerName(searchTerm: string): Promise<Array<OrderInternal>>;
    setDeliveryBoyOnlineStatus(isOnline: boolean): Promise<void>;
    updateDeliveryBoyLocation(location: Location): Promise<void>;
}
