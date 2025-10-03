# 🚀 ChefPax Automation Setup Guide

## Phase 1: Core Automation Foundation ✅ COMPLETED

The ChefPax automation framework is now fully implemented and ready for testing! This guide will help you set up and test the complete automation system.

## 🛠️ **Setup Instructions**

### **Step 1: Environment Setup**

1. **Install Redis** (required for job queues):
   ```bash
   # macOS with Homebrew
   brew install redis
   brew services start redis
   
   # Ubuntu/Debian
   sudo apt update
   sudo apt install redis-server
   sudo systemctl start redis-server
   
   # Windows (using WSL or Docker)
   docker run -d -p 6379:6379 redis:alpine
   ```

2. **Add Redis URL to environment**:
   ```bash
   # Add to .env.local
   REDIS_URL="redis://localhost:6379"
   ```

### **Step 2: Database Initialization**

Initialize the automation database collections:

```bash
# Option 1: Using npm script
npm run init-db

# Option 2: Using API endpoint
curl -X POST http://localhost:3000/api/admin/init-db
```

This creates the following collections:
- `productionTasks` - Production task scheduling
- `deliveryJobs` - Delivery job management
- `automationJobs` - Automation workflow jobs
- `enhancedSubscriptions` - Subscription management
- `inventoryAlerts` - Inventory monitoring
- `marketingCampaigns` - Marketing automation
- `businessMetrics` - Analytics and reporting

### **Step 3: Start Job Queue Workers**

Start the background workers that process automation tasks:

```bash
# In a separate terminal
npm run worker
```

You should see:
```
🚀 ChefPax job queue workers started
📋 Available workers:
  - Production tasks (SEED → GERMINATE → LIGHT → HARVEST → PACK)
  - Delivery jobs (courier requests, status updates, notifications)
  - Notifications (email, SMS, push notifications)
  - Automation (subscription cycles, inventory checks, reminders)

⏰ Workers are running in the background...
```

### **Step 4: Test the Automation Workflow**

Run the automation test to verify everything is working:

```bash
npm run test-automation
```

This test will:
1. ✅ Create production tasks for a test order
2. ✅ Create a delivery job
3. ✅ Verify database collections
4. ✅ Check job queues
5. ✅ Test task completion workflow

## 🎯 **How the Automation Works**

### **Order Processing Workflow**

1. **Customer places order** → Stripe checkout
2. **Webhook triggers** → `/api/stripe/webhook`
3. **Order created** → Database record
4. **Production tasks created** → Based on product lead times
5. **Delivery job created** → For delivery date
6. **Jobs queued** → BullMQ processes in background
7. **Customer notified** → Order confirmation

### **Production Task Automation**

When an order is placed, the system automatically creates production tasks:

- **SEED** (Day 0) → Plant seeds in tray
- **GERMINATE** (Days 0-2) → Keep in dark, moist conditions  
- **LIGHT** (Days 2-14) → Provide 12-16 hours of light daily
- **HARVEST** (Day 14) → Ready for first harvest
- **PACK** (Day 14) → Package for delivery

### **Delivery Automation**

- **Courier request** → Scheduled day before delivery
- **Status updates** → Real-time tracking
- **Customer notifications** → Delivery updates
- **Route optimization** → Efficient delivery routes

## 📊 **Admin Dashboard**

Access the production management interface:

```
http://localhost:3000/admin/production
```

**Features:**
- 📋 **Today's Tasks** - Production tasks due today
- 🚨 **Urgent Tasks** - High priority tasks
- ⏰ **All Tasks** - Complete task list
- 🚚 **Deliveries** - Delivery job status
- ✅ **Task Completion** - Mark tasks as done
- 📝 **Notes** - Add completion notes

## 🧪 **Testing the System**

### **Test 1: Place a Real Order**

1. Go to `http://localhost:3000/shop`
2. Add products to cart
3. Complete checkout
4. Check admin dashboard for production tasks

### **Test 2: Monitor Job Processing**

1. Start workers: `npm run worker`
2. Place test order
3. Watch console for job processing logs
4. Verify tasks in admin dashboard

### **Test 3: Complete Production Tasks**

1. Go to admin dashboard
2. Click on a production task
3. Mark as completed with notes
4. Verify status update

## 🔧 **Troubleshooting**

### **Redis Connection Issues**
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Check Redis logs
brew services list | grep redis
```

### **Database Connection Issues**
```bash
# Test MongoDB connection
npm run init-db
# Should create collections successfully
```

### **Job Queue Issues**
```bash
# Check worker logs
npm run worker
# Should show workers starting without errors
```

### **Webhook Issues**
```bash
# Test webhook locally
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'
```

## 📈 **Monitoring & Analytics**

### **Production Metrics**
- Task completion rates
- Production efficiency
- Delivery performance
- Customer satisfaction

### **Business Metrics**
- Order processing time
- Subscription renewal rates
- Revenue forecasting
- Growth tracking

## 🚀 **Next Steps (Phase 2)**

Once Phase 1 is working, the next phase includes:

1. **Courier Integration** - Uber Direct, Roadie, Shippo
2. **Advanced Notifications** - Email, SMS, push notifications
3. **Marketing Automation** - Drip campaigns, retention flows
4. **Analytics Dashboard** - Business insights and reporting
5. **Inventory Management** - Auto-reorder, stock alerts

## 🎉 **Success Criteria**

Phase 1 is complete when:

- ✅ Orders automatically create production tasks
- ✅ Production tasks are scheduled and queued
- ✅ Delivery jobs are created and tracked
- ✅ Admin dashboard shows real-time data
- ✅ Job workers process tasks automatically
- ✅ Task completion workflow works
- ✅ End-to-end automation is functional

## 📞 **Support**

If you encounter issues:

1. Check the console logs for error messages
2. Verify Redis is running and accessible
3. Ensure MongoDB connection is working
4. Test individual components using the test scripts
5. Review the troubleshooting section above

---

**🎯 Phase 1 Status: ✅ COMPLETE**

The ChefPax automation foundation is now fully operational! You can scale your microgreen operation beyond manual processes and focus on growth while the system handles production scheduling, delivery coordination, and customer management automatically.

**Next:** Ready to move to Phase 2 for advanced features and integrations! 🚀
