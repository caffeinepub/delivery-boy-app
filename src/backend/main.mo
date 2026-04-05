import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type OrderId = Nat;

  private var nextOrderId = 1;

  module DeliveryBoyProfile {
    public type T = {
      name : Text;
      phoneNumber : Text;
      isOnline : Bool;
      location : {
        latitude : Float;
        longitude : Float;
      };
    };

    public func compare(profile1 : T, profile2 : T) : Order.Order {
      Text.compare(profile1.name, profile2.name);
    };
  };

  type Location = {
    latitude : Float;
    longitude : Float;
  };

  type OrderStatus = {
    #new;
    #ongoing;
    #completed;
    #rejected;
  };

  type OrderInternal = {
    id : OrderId;
    customerName : Text;
    customerPhone : Text;
    pickupAddress : Text;
    dropoffAddress : Text;
    distanceKm : Float;
    deliveryFee : Float;
    status : OrderStatus;
    assignedDeliveryBoy : ?Principal;
    createdTimestamp : Int;
  };

  module OrderInternal {
    public func compare(order1 : OrderInternal, order2 : OrderInternal) : Order.Order {
      switch (Int.compare(order1.createdTimestamp, order2.createdTimestamp)) {
        case (#equal) { Nat.compare(order1.id, order2.id) };
        case (other) { other };
      };
    };

    public func compareByOrderId(order1 : OrderInternal, order2 : OrderInternal) : Order.Order {
      Nat.compare(order1.id, order2.id);
    };
  };

  let orders = Map.empty<OrderId, OrderInternal>();
  let deliveryBoyProfiles = Map.empty<Principal, DeliveryBoyProfile.T>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management (required by frontend)
  public type UserProfile = DeliveryBoyProfile.T;

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    deliveryBoyProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    deliveryBoyProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    deliveryBoyProfiles.add(caller, profile);
  };

  private func getInternalOrder(orderId : OrderId) : OrderInternal {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  public shared ({ caller }) func createOrder(order : OrderInternal) : async OrderId {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create orders");
    };
    let newOrderId = nextOrderId;
    nextOrderId += 1;
    let newOrder : OrderInternal = {
      order with
      id = newOrderId;
      status = #new;
      assignedDeliveryBoy = null;
      createdTimestamp = Time.now();
    };
    orders.add(newOrderId, newOrder);
    newOrderId;
  };

  public shared ({ caller }) func acceptOrder(orderId : OrderId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only delivery boys can accept orders");
    };
    let order = getInternalOrder(orderId);
    if (order.status != #new) {
      Runtime.trap("Order is not available for acceptance");
    };
    let updatedOrder : OrderInternal = {
      order with
      status = #ongoing;
      assignedDeliveryBoy = ?caller;
    };
    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func completeOrder(orderId : OrderId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only delivery boys can complete orders");
    };
    let order = getInternalOrder(orderId);
    switch (order.assignedDeliveryBoy) {
      case (null) { Runtime.trap("Order not assigned to a delivery boy") };
      case (?deliveryBoy) {
        if (caller != deliveryBoy) {
          Runtime.trap("Unauthorized: You can only complete your own orders");
        };
      };
    };
    if (order.status != #ongoing) {
      Runtime.trap("Order is not ongoing");
    };
    let updatedOrder : OrderInternal = {
      order with
      status = #completed;
    };
    orders.add(orderId, updatedOrder);
  };

  public shared ({ caller }) func rejectOrder(orderId : OrderId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only delivery boys can reject orders");
    };
    let order = getInternalOrder(orderId);

    if (order.status == #new) {
      let updatedOrder : OrderInternal = {
        order with
        status = #rejected;
      };
      orders.add(orderId, updatedOrder);
    } else if (order.status == #ongoing) {
      switch (order.assignedDeliveryBoy) {
        case (null) { Runtime.trap("Order not assigned to a delivery boy") };
        case (?deliveryBoy) {
          if (caller != deliveryBoy) {
            Runtime.trap("Unauthorized: You can only reject your own orders");
          };
        };
      };
      let updatedOrder : OrderInternal = {
        order with
        status = #new;
        assignedDeliveryBoy = null;
      };
      orders.add(orderId, updatedOrder);
    } else {
      Runtime.trap("Order cannot be rejected in current status");
    };
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [OrderInternal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    orders.values().toArray().filter(func(order) { order.status == status }).sort();
  };

  public query ({ caller }) func getOrdersForDeliveryBoy(deliveryBoy : Principal) : async [OrderInternal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    if (caller != deliveryBoy and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    orders.values().toArray().filter(func(order) {
      switch (order.assignedDeliveryBoy) {
        case (?d) { d == deliveryBoy };
        case (null) { false };
      };
    }).sort();
  };

  public query ({ caller }) func searchOrdersByCustomerName(searchTerm : Text) : async [OrderInternal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can search orders");
    };
    let termLower = searchTerm.toLower();
    orders.values().toArray().filter(func(order) {
      order.customerName.toLower().contains(#text termLower);
    }).sort();
  };

  public shared ({ caller }) func updateDeliveryBoyLocation(location : Location) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only delivery boys can update location");
    };
    let profile = switch (deliveryBoyProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Profile not found");
      };
      case (?profile) { profile };
    };
    let updatedProfile : DeliveryBoyProfile.T = {
      profile with
      location;
    };
    deliveryBoyProfiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getDeliveryBoyEarnings(deliveryBoy : Principal) : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view earnings");
    };
    if (caller != deliveryBoy and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own earnings");
    };
    var totalEarnings = 0.0;
    for (order in orders.values()) {
      switch (order.assignedDeliveryBoy) {
        case (?d) {
          if (d == deliveryBoy and order.status == #completed) {
            totalEarnings += order.deliveryFee;
          };
        };
        case (null) {};
      };
    };
    totalEarnings;
  };

  public query ({ caller }) func getDeliveryHistory(deliveryBoy : Principal) : async [OrderInternal] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view delivery history");
    };
    if (caller != deliveryBoy and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own delivery history");
    };
    orders.values().toArray().filter(func(order) {
      switch (order.assignedDeliveryBoy) {
        case (?d) { d == deliveryBoy and order.status == #completed };
        case (null) { false };
      };
    }).sort();
  };

  public shared ({ caller }) func setDeliveryBoyOnlineStatus(isOnline : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only delivery boys can update online status");
    };
    switch (deliveryBoyProfiles.get(caller)) {
      case (null) {
        Runtime.trap("Profile not found");
      };
      case (?profile) {
        let updatedProfile : DeliveryBoyProfile.T = {
          profile with
          isOnline;
        };
        deliveryBoyProfiles.add(caller, updatedProfile);
      };
    };
  };

  public query ({ caller }) func getAllDeliveryBoys() : async [DeliveryBoyProfile.T] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view delivery boys");
    };
    deliveryBoyProfiles.values().toArray().sort();
  };

  public query ({ caller }) func getOrder(orderId : OrderId) : async OrderInternal {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    getInternalOrder(orderId);
  };

  public shared ({ caller }) func createSampleOrders() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create sample orders");
    };
    let sampleOrders = [
      // Hyderabad orders
      {
        customerName = "Ravi Kumar";
        customerPhone = "9876501234";
        pickupAddress = "Charminar, Hyderabad";
        dropoffAddress = "Banjara Hills, Road No. 12, Hyderabad";
        distanceKm = 7.5;
        deliveryFee = 45.0;
        status = #new;
        assignedDeliveryBoy = null;
        createdTimestamp = Time.now();
        id = 0;
      },
      {
        customerName = "Sunita Reddy";
        customerPhone = "9988776655";
        pickupAddress = "Secunderabad Railway Station";
        dropoffAddress = "Hitech City, Madhapur, Hyderabad";
        distanceKm = 12.0;
        deliveryFee = 60.0;
        status = #new;
        assignedDeliveryBoy = null;
        createdTimestamp = Time.now();
        id = 0;
      },
      {
        customerName = "Prasad Naidu";
        customerPhone = "8765432109";
        pickupAddress = "Ameerpet Metro Station, Hyderabad";
        dropoffAddress = "Kukatpally Housing Board, Hyderabad";
        distanceKm = 5.0;
        deliveryFee = 30.0;
        status = #ongoing;
        assignedDeliveryBoy = ?Principal.fromText("aaaaa-aa");
        createdTimestamp = Time.now();
        id = 0;
      },
      // Tirupati orders
      {
        customerName = "Venkata Rao";
        customerPhone = "9701234567";
        pickupAddress = "Tirupati Railway Station";
        dropoffAddress = "Alipiri Gate, Tirupati";
        distanceKm = 4.5;
        deliveryFee = 25.0;
        status = #new;
        assignedDeliveryBoy = null;
        createdTimestamp = Time.now();
        id = 0;
      },
      {
        customerName = "Lakshmi Devi";
        customerPhone = "9812345678";
        pickupAddress = "Tirupati Bus Stand, Tirupati";
        dropoffAddress = "Srinivasa Nagar, Tirupati";
        distanceKm = 3.0;
        deliveryFee = 20.0;
        status = #new;
        assignedDeliveryBoy = null;
        createdTimestamp = Time.now();
        id = 0;
      },
      {
        customerName = "Suresh Babu";
        customerPhone = "8901234567";
        pickupAddress = "Kapila Theertham Road, Tirupati";
        dropoffAddress = "Tirumala Hill, Tirupati";
        distanceKm = 8.0;
        deliveryFee = 40.0;
        status = #completed;
        assignedDeliveryBoy = ?Principal.fromText("bbbbb-bb");
        createdTimestamp = Time.now();
        id = 0;
      },
      {
        customerName = "Padmavathi";
        customerPhone = "7654321098";
        pickupAddress = "SVU College Road, Tirupati";
        dropoffAddress = "Tiruchanur, Tirupati";
        distanceKm = 6.0;
        deliveryFee = 35.0;
        status = #new;
        assignedDeliveryBoy = null;
        createdTimestamp = Time.now();
        id = 0;
      },
      {
        customerName = "Govinda Swamy";
        customerPhone = "9345678901";
        pickupAddress = "Govindaraja Swamy Temple, Tirupati";
        dropoffAddress = "Renigunta Junction, Tirupati";
        distanceKm = 5.5;
        deliveryFee = 30.0;
        status = #rejected;
        assignedDeliveryBoy = ?Principal.fromText("ccccc-cc");
        createdTimestamp = Time.now();
        id = 0;
      },
    ];

    for (order in sampleOrders.values()) {
      let newOrderId = nextOrderId;
      nextOrderId += 1;
      orders.add(
        newOrderId,
        { order with id = newOrderId },
      );
    };
  };
};
