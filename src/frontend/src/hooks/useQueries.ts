import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { OrderStatus } from "../backend";
import type { OrderInternal } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useNewOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<OrderInternal[]>({
    queryKey: ["orders", "new"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrdersByStatus(OrderStatus.new_);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useOngoingOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<OrderInternal[]>({
    queryKey: ["orders", "ongoing"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrdersByStatus(OrderStatus.ongoing);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useCompletedOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<OrderInternal[]>({
    queryKey: ["orders", "completed"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrdersByStatus(OrderStatus.completed);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRejectedOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<OrderInternal[]>({
    queryKey: ["orders", "rejected"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrdersByStatus(OrderStatus.rejected);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<OrderInternal[]>({
    queryKey: ["orders", "mine", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getOrdersForDeliveryBoy(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useEarnings() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<number>({
    queryKey: ["earnings", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return 0;
      return actor.getDeliveryBoyEarnings(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useDeliveryHistory() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<OrderInternal[]>({
    queryKey: ["deliveryHistory", identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getDeliveryHistory(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useOrderActions() {
  const queryClient = useQueryClient();
  const invalidateOrders = () => {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["earnings"] });
    queryClient.invalidateQueries({ queryKey: ["deliveryHistory"] });
  };
  return { invalidateOrders };
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllDeliveryBoys() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["deliveryBoys"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDeliveryBoys();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: OrderInternal) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOrder(order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
