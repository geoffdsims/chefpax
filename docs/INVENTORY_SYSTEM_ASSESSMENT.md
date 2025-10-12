# 📊 ChefPax Inventory System Assessment

**Date:** October 11, 2025  
**Purpose:** Compare current implementation vs. automation vision

---

## Current Implementation Analysis

### ✅ What's Working Now

#### 1. **Real-Time Availability Tracking**
**Location:** `src/app/api/products/route.ts` (lines 19-43)

```typescript
// Calculate real-time availability:
const orders = await db.collection("orders").find({
  "cart.productId": product._id.toString(),
  status: { $in: ["paid", "confirmed", "processing"] },
  createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
}).toArray();

const soldQty = orders.reduce((total, order) => {
  const cartItem = order.cart?.find((item: any) => item.productId === product._id.toString());
  return total + (cartItem?.qty || 0);
}, 0);

const available = Math.max(0, weeklyCapacity - soldQty);
```

**How It Works:**
- Each product has `weeklyCapacity` (e.g., Sunflower: 3 trays/week)
- System queries orders from last 7 days
- Calculates `soldQty` for each product
- **Available = weeklyCapacity - soldQty**
- Updates `currentWeekAvailable` dynamically

**Example:**
- Sunflower `weeklyCapacity`: 3 trays
- Orders this week: 1 tray sold
- **Current availability: 2 trays** ✅

---

#### 2. **Stock Status Display**
**Location:** `src/app/shop/page.tsx` (lines 246-261)

```typescript
function getAvailabilityStatus(product: Product) {
  if (forecast.available === 0) {
    return { status: "sold_out", message: "Sold out for this delivery" };
  } else if (forecast.available <= 3) {
    return { status: "low_stock", message: `Only ${forecast.available} left` };
  } else {
    return { status: "in_stock", message: `${forecast.available} available` };
  }
}
```

**Display Logic:**
- 🔴 **Sold Out:** 0 available
- 🟡 **Low Stock:** ≤3 available
- 🟢 **In Stock:** >3 available

**UI:** Badge overlay on product image + status message

---

### ⚠️ Current Limitations

#### 1. **Weekly Capacity is Static**
**Problem:** `weeklyCapacity` is hardcoded in `src/lib/inventory.ts`

```typescript
// Current approach:
weeklyCapacity: 3,  // Manual setting
```

**What's Missing:**
- ❌ No connection to **actual grow rack capacity**
- ❌ No tier-based space allocation
- ❌ No seasonal adjustments
- ❌ No dynamic capacity based on production tasks

**Impact:** If you can actually grow 5 trays but set capacity at 3, you're losing sales!

---

#### 2. **No Production-to-Inventory Link**
**Problem:** Inventory doesn't track **what's actually growing**

**Current Flow:**
```
Order placed → Tasks created → ??? → Magically available
```

**What's Missing:**
```
Order placed 
  ↓
Tasks created (SEED → HARVEST)
  ↓
❌ NO INVENTORY RESERVATION ❌
  ↓
Another order can oversell the same capacity
  ↓
Inventory doesn't decrease until order completes
```

**Example Scenario:**
- Monday: Customer orders 2 Sunflower trays (delivery Friday)
- Tuesday: Another customer orders 2 Sunflower trays (delivery Friday)
- Problem: You only have capacity for 3 trays/week!
- **Result: One order will be short**

---

#### 3. **No Forward-Looking Availability**
**Problem:** Customers can't see availability for **future delivery dates**

**Current:** Only shows "this week's" availability  
**Should Be:** Show availability for each delivery date (Tue, Thu, Sat)

**Desired UX:**
```
📦 Select Delivery Date:
○ Tue Oct 15 - 3 available
○ Thu Oct 17 - 5 available (more capacity!)
○ Sat Oct 19 - 2 available (low stock)
```

---

#### 4. **IoT Sensors Not Integrated**
**Status:** Hardware arrived, setup paused (waiting for female-to-male cables)

**What's Missing:**
- ❌ Real-time grow status from sensors
- ❌ Harvest readiness prediction
- ❌ Quality scoring (color, height, density)
- ❌ Automated task updates based on sensor data

**Vision:**
```typescript
// When DHT22 detects ideal conditions:
if (temp === 72 && humidity === 85 && lightHours >= 14) {
  task.status = 'READY_TO_HARVEST';
  task.estimatedQuality = 'A+';
}
```

---

## 🎯 Automation Vision vs. Reality

### Vision: Production-Driven Inventory

**From `docs/AUTOMATION_PILLARS.md`:**

> **Production Task System** creates SEED → GERMINATE → LIGHT → HARVEST → PACK tasks with `runAt` timestamps. Inventory should reflect **what's in the grow cycle**, not just static capacity.

**Ideal Flow:**
```
1. Order placed for "Fri Oct 18 delivery"
   ↓
2. System calculates: Need to seed on Mon Oct 7 (11-day lead time)
   ↓
3. SEED task created for Mon Oct 7
   ↓
4. ✅ INVENTORY RESERVED for that delivery date
   ↓
5. Other customers see "3 available → 2 available" for Oct 18
   ↓
6. HARVEST task completes Oct 18
   ↓
7. ✅ INVENTORY FULFILLED, order marked ready
```

**Current Reality:**
```
1. Order placed
   ↓
2. Tasks created
   ↓
3. ❌ No inventory reservation
   ↓
4. Availability calculation only looks at past orders
   ↓
5. ❌ No future date forecasting
```

---

### Vision: Tier-Based Capacity Management

**From grow cards:**
- **Tier 1:** High water (Sunflower, Pea) - 20 shelves
- **Tier 2:** Medium water (Broccoli, Radish) - 15 shelves
- **Tier 3:** Low water (Kohlrabi, Superfood) - 15 shelves
- **Tier 4:** Very low water (Basils) - 10 shelves
- **Tier 5:** Minimal water (Amaranth, Shiso) - 5 shelves

**Total: 65 rack positions across 5 tiers**

**Capacity Should Be:**
```typescript
// Dynamic capacity based on tier availability:
const tier1Capacity = 20; // 20×10 = 200 trays/week (if 10-day cycle)
const tier5Capacity = 5;  // 5×12 = 60 trays/week (if 12-day cycle)

// Calculate available slots per delivery date:
const availability = calculateTierAvailability({
  tier: product.tier,
  deliveryDate: requestedDate,
  existingTasks: productionTasks
});
```

**Current Reality:**
```typescript
weeklyCapacity: 3  // ❌ Arbitrary number
```

---

### Vision: IoT-Enhanced Inventory

**From `docs/IOT_HARDWARE_STATUS.md`:**

> Raspberry Pi + DHT22 + BH1750 + HC-SR04 sensors monitor:
> - Temperature & humidity (ideal for harvest)
> - Light intensity (PAR/lumen tracking)
> - Water level (flood/drain cycles)
> - CO2 levels (growth optimization)

**Should Enable:**
1. **Real-Time Harvest Prediction**
   ```typescript
   if (sensorData.height > 3.5 && sensorData.color === 'vibrant') {
     task.harvestDate = 'TODAY'; // Override scheduled date
     inventory.qualityScore = 'A+';
   }
   ```

2. **Auto-Adjust Lead Times**
   ```typescript
   if (avgTemp < 68) {
     product.leadTimeDays += 2; // Slower growth in cold
   }
   ```

3. **Quality-Based Pricing**
   ```typescript
   if (qualityScore === 'A+') {
     product.priceCents *= 1.1; // Premium pricing
   }
   ```

**Current Reality:**
- ❌ No sensor integration
- ❌ Lead times are static
- ❌ No quality tracking

---

## 🛠️ Implementation Roadmap

### Phase 1: Production-Linked Inventory (1-2 Days)

**Goal:** Connect inventory to production tasks

#### Step 1: Add Inventory Reservation
```typescript
// When order placed:
await db.collection('inventoryReservations').insertOne({
  productId: product._id,
  orderId: order._id,
  deliveryDate: order.deliveryDate,
  quantity: cartItem.qty,
  status: 'reserved',
  productionTasks: [seedTask._id, harvestTask._id]
});
```

#### Step 2: Update Availability Calculation
```typescript
// NEW: Look at both orders AND reservations:
const reserved = await db.collection('inventoryReservations').countDocuments({
  productId: product._id,
  deliveryDate: requestedDate,
  status: { $in: ['reserved', 'in_progress'] }
});

const available = weeklyCapacity - reserved;
```

#### Step 3: Release Inventory on Completion
```typescript
// When PACK task completes:
await db.collection('inventoryReservations').updateOne(
  { orderId: order._id },
  { $set: { status: 'fulfilled', completedAt: new Date() } }
);
```

---

### Phase 2: Tier-Based Capacity (2-3 Days)

**Goal:** Calculate capacity dynamically based on rack space

#### Step 1: Define Tier Capacity
```typescript
const RACK_CAPACITY = {
  tier1: { shelves: 20, cycledays: 10 },
  tier2: { shelves: 15, cycleDays: 10 },
  tier3: { shelves: 15, cycleDays: 10 },
  tier4: { shelves: 10, cycleDays: 15 },
  tier5: { shelves: 5, cycleDays: 12 }
};
```

#### Step 2: Calculate Available Slots
```typescript
function calculateTierAvailability(tier: number, deliveryDate: Date) {
  const tierConfig = RACK_CAPACITY[`tier${tier}`];
  
  // Find all tasks using this tier for this delivery window:
  const usedSlots = await db.collection('productionTasks').countDocuments({
    tier,
    runAt: { 
      $gte: new Date(deliveryDate - tierConfig.cycleDays * 24 * 60 * 60 * 1000),
      $lte: deliveryDate
    },
    status: { $ne: 'DONE' }
  });
  
  return tierConfig.shelves - usedSlots;
}
```

#### Step 3: Update Product Schema
```typescript
// Add to inventory.ts:
tier: 1,  // Assign each product to a tier
leadTimeDays: 10,
rackSlots: 1  // Some products might need 2 slots (double stack)
```

---

### Phase 3: Future Date Forecasting (1 Day)

**Goal:** Show availability for multiple delivery dates

#### Step 1: API Endpoint
```typescript
// GET /api/inventory/forecast?productId=sunflower-live-tray
export async function GET(req: Request) {
  const { productId } = req.query;
  
  // Next 7 delivery dates:
  const deliveryDates = getNextDeliveryDates(7); // [Tue, Thu, Sat, Tue, Thu, Sat, Tue]
  
  const forecast = await Promise.all(deliveryDates.map(async (date) => {
    const available = await calculateAvailability(productId, date);
    return {
      date,
      available,
      status: available === 0 ? 'sold_out' : available <= 3 ? 'low_stock' : 'in_stock'
    };
  }));
  
  return NextResponse.json(forecast);
}
```

#### Step 2: UI Component
```tsx
// DeliveryDatePicker.tsx
function DeliveryDatePicker({ product }: { product: Product }) {
  const { data: forecast } = useSWR(`/api/inventory/forecast?productId=${product._id}`);
  
  return (
    <Box>
      <Typography variant="h6">Select Delivery Date:</Typography>
      {forecast?.map((day) => (
        <Card key={day.date} sx={{ opacity: day.available === 0 ? 0.5 : 1 }}>
          <Radio value={day.date} disabled={day.available === 0} />
          <Typography>{formatDate(day.date)}</Typography>
          <Chip 
            label={day.status === 'sold_out' ? 'Sold Out' : `${day.available} left`}
            color={day.status === 'in_stock' ? 'success' : 'warning'}
          />
        </Card>
      ))}
    </Box>
  );
}
```

---

### Phase 4: IoT Integration (2-3 Weeks)

**Goal:** Real-time grow monitoring and harvest prediction

**Status:** Hardware arrived, setup paused (need female-to-male cables)

#### When Cables Arrive:

**Step 1: Raspberry Pi Sensor Setup**
- Connect DHT22 (temp/humidity) to GPIO 17
- Connect BH1750 (light) via I2C
- Connect HC-SR04 (water level) to GPIO 23/24
- Connect MH-Z19C (CO2) via UART

**Step 2: Data Collection**
```python
# raspberry-pi/sensor_monitor.py (already exists)
while True:
    data = {
        "temperature": dht22.temperature,
        "humidity": dht22.humidity,
        "lightLux": bh1750.lux,
        "waterLevel": hc_sr04.distance,
        "co2": mh_z19c.co2,
        "timestamp": time.time()
    }
    
    # Send to ChefPax API:
    requests.post("https://chefpax.com/api/iot/sensors", json=data)
    time.sleep(300)  # Every 5 minutes
```

**Step 3: Sensor Data → Inventory**
```typescript
// /api/iot/sensors/route.ts (rebuild - was deleted)
export async function POST(req: Request) {
  const sensorData = await req.json();
  
  // Find tasks in LIGHT or GERMINATE phase:
  const activeTasks = await db.collection('productionTasks').find({
    type: { $in: ['GERMINATE', 'LIGHT'] },
    status: 'IN_PROGRESS'
  }).toArray();
  
  for (const task of activeTasks) {
    const product = await db.collection('products').findOne({ _id: task.productId });
    
    // Check if ready to harvest early:
    if (isReadyToHarvest(sensorData, product)) {
      await db.collection('productionTasks').updateOne(
        { _id: task._id },
        { 
          $set: { 
            status: 'READY',
            notes: `Early harvest recommended (optimal conditions detected)`
          }
        }
      );
      
      // Notify via Slack/SMS:
      await notify(`🌱 ${product.name} ready to harvest early!`);
    }
  }
  
  return NextResponse.json({ success: true });
}
```

---

## 📊 Summary Table

| Feature | Current | Vision | Implementation Priority |
|---------|---------|--------|------------------------|
| **Real-time availability** | ✅ Working | ✅ Complete | ✅ Done |
| **Stock status display** | ✅ Working | ✅ Complete | ✅ Done |
| **Inventory reservation** | ❌ Missing | ✅ Needed | 🔥 **High** (Phase 1) |
| **Production task link** | ❌ Missing | ✅ Needed | 🔥 **High** (Phase 1) |
| **Tier-based capacity** | ❌ Static | ✅ Dynamic | 🟡 **Medium** (Phase 2) |
| **Future date forecast** | ❌ Missing | ✅ Needed | 🟡 **Medium** (Phase 3) |
| **IoT sensor integration** | ❌ Paused | ✅ Planned | 🔵 **Low** (Phase 4 - hardware dependent) |
| **Quality scoring** | ❌ Missing | ✅ Planned | 🔵 **Low** (Phase 4) |
| **Dynamic lead times** | ❌ Static | ✅ Planned | 🔵 **Low** (Phase 4) |

---

## 🎯 Immediate Action Items

### Critical (Do First)
1. ✅ Fix MongoDB IP whitelist (DONE!)
2. ✅ Update product catalog (DONE!)
3. ✅ Compact ProductCard design (DONE!)
4. ⏳ **Implement inventory reservation system** (Phase 1)
5. ⏳ **Link production tasks to inventory** (Phase 1)

### Important (This Week)
6. ⏳ Add future date forecasting API
7. ⏳ Update shop UI with delivery date picker
8. ⏳ Calculate tier-based capacity

### Nice to Have (When Hardware Ready)
9. ⏳ Complete IoT sensor setup (waiting on cables)
10. ⏳ Implement harvest prediction logic
11. ⏳ Add quality scoring

---

## 💡 Key Insight

**Current System:** "Weekly capacity" is a **promise** to customers  
**Vision System:** "Available slots" is a **real-time count** of grow rack space

**The Gap:** Orders create production tasks, but inventory doesn't reserve capacity until the order is already placed. This creates a race condition where two customers can order the last tray simultaneously.

**Solution:** Phase 1 (inventory reservation) bridges this gap with minimal code changes!

---

**Next Step:** Implement Phase 1 (inventory reservation system)?


