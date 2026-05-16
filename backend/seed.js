require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Route = require('./models/Route');
const Stop = require('./models/Stop');
const Bus = require('./models/Bus');
const Feedback = require('./models/Feedback');
const DelayReport = require('./models/DelayReport');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await Promise.all([
    User.deleteMany(), Route.deleteMany(), Stop.deleteMany(),
    Bus.deleteMany(), Feedback.deleteMany(), DelayReport.deleteMany()
  ]);

  const adminHash = await bcrypt.hash('admin123', 10);
  const userHash = await bcrypt.hash('user123', 10);

  const [admin, user1, user2] = await User.insertMany([
    { name: 'Admin User', email: 'admin@transit.com', passwordHash: adminHash, role: 'admin' },
    { name: 'Riya Nair', email: 'riya@example.com', passwordHash: userHash, role: 'passenger' },
    { name: 'Arjun Menon', email: 'arjun@example.com', passwordHash: userHash, role: 'passenger' }
  ]);

  const routes = await Route.insertMany([
    { routeCode: 'KL-01', routeName: 'Kollam - Thiruvananthapuram' },
    { routeCode: 'KL-02', routeName: 'Kollam - Kochi' },
    { routeCode: 'KL-03', routeName: 'Kollam - Alappuzha' },
    { routeCode: 'KL-04', routeName: 'Kollam - Pathanamthitta' },
    { routeCode: 'KL-05', routeName: 'Kollam - Punalur' }
  ]);

  const stops = await Stop.insertMany([
    { stopName: 'Kollam Bus Stand', location: 'Kollam' },
    { stopName: 'Paravur', location: 'Paravur' },
    { stopName: 'Varkala', location: 'Varkala' },
    { stopName: 'Attingal', location: 'Attingal' },
    { stopName: 'Thiruvananthapuram Central', location: 'Thiruvananthapuram' },
    { stopName: 'Karunagapally', location: 'Karunagapally' },
    { stopName: 'Kayamkulam', location: 'Kayamkulam' },
    { stopName: 'Alappuzha', location: 'Alappuzha' }
  ]);

  const buses = await Bus.insertMany([
    { busNumber: 'KL-02-AB-1234', routeId: routes[0]._id },
    { busNumber: 'KL-02-CD-5678', routeId: routes[0]._id },
    { busNumber: 'KL-02-EF-9012', routeId: routes[1]._id },
    { busNumber: 'KL-02-GH-3456', routeId: routes[2]._id },
    { busNumber: 'KL-02-IJ-7890', routeId: routes[3]._id }
  ]);

  await Feedback.insertMany([
    { userId: user1._id, routeId: routes[0]._id, busId: buses[0]._id, stopId: stops[0]._id, category: 'punctuality', rating: 4, comment: 'Generally on time, seats are clean', status: 'approved' },
    { userId: user2._id, routeId: routes[1]._id, busId: buses[2]._id, stopId: stops[5]._id, category: 'cleanliness', rating: 2, comment: 'Bus was dirty inside', status: 'pending' },
    { userId: user1._id, routeId: routes[2]._id, stopId: stops[7]._id, category: 'overcrowding', rating: 3, comment: 'Very crowded during peak hours', status: 'approved' },
    { userId: user2._id, routeId: routes[0]._id, busId: buses[1]._id, stopId: stops[2]._id, category: 'staff', rating: 5, comment: 'Driver was courteous and helpful', status: 'approved' },
    { userId: user1._id, routeId: routes[3]._id, category: 'safety', rating: 2, comment: 'Reckless driving observed', status: 'pending' }
  ]);

  const d = new Date();
  const daysAgo = (n) => new Date(d - n * 86400000);

  await DelayReport.insertMany([
    { userId: user1._id, routeId: routes[0]._id, stopId: stops[0]._id, expectedTime: '08:00', actualTime: '08:25', delayMinutes: 25, crowdLevel: 'high', status: 'verified', createdAt: daysAgo(0) },
    { userId: user2._id, routeId: routes[1]._id, stopId: stops[5]._id, expectedTime: '09:30', actualTime: '10:00', delayMinutes: 30, crowdLevel: 'very_high', status: 'new', createdAt: daysAgo(1) },
    { userId: user1._id, routeId: routes[0]._id, stopId: stops[2]._id, expectedTime: '11:00', actualTime: '11:40', delayMinutes: 40, crowdLevel: 'medium', status: 'new', createdAt: daysAgo(2) },
    { userId: user2._id, routeId: routes[2]._id, stopId: stops[6]._id, expectedTime: '14:00', delayMinutes: 15, crowdLevel: 'low', status: 'resolved', createdAt: daysAgo(3) },
    { userId: user1._id, routeId: routes[1]._id, stopId: stops[4]._id, expectedTime: '16:00', actualTime: '16:50', delayMinutes: 50, crowdLevel: 'very_high', status: 'verified', createdAt: daysAgo(4) },
    { userId: user2._id, routeId: routes[0]._id, stopId: stops[1]._id, delayMinutes: 20, crowdLevel: 'high', status: 'new', createdAt: daysAgo(5) },
    { userId: user1._id, routeId: routes[3]._id, stopId: stops[3]._id, delayMinutes: 10, crowdLevel: 'low', status: 'new', createdAt: daysAgo(6) }
  ]);

  console.log('✅ Seed complete!');
  console.log('Admin: admin@transit.com / admin123');
  console.log('User:  riya@example.com / user123');
  await mongoose.disconnect();
}

seed().catch(console.error);
