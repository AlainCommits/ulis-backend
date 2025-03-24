import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
let authToken: string;
let adminToken: string;
let courseId: string;
let userId: string;

const testAPI = async () => {
  try {
    // 1. Admin Login
    console.log('1. Testing Admin Login...');
    const adminLoginResponse = await axios.post(`${API_URL}/users/login`, {
      email: "admin@test.com",
      password: "admin123"
    });
    adminToken = adminLoginResponse.data.data.token;
    console.log('✅ Admin Login successful');

    // 2. User registrieren
    console.log('1. Testing User Registration...');
    const registerResponse = await axios.post(`${API_URL}/users/register`, {
      email: "test@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Doe"
    });
    userId = registerResponse.data.data.user.id;
    console.log('✅ User Registration successful');

    // 2. User Login
    console.log('\n2. Testing User Login...');
    const loginResponse = await axios.post(`${API_URL}/users/login`, {
      email: "test@example.com",
      password: "password123"
    });
    authToken = loginResponse.data.data.token;
    console.log('✅ Login successful');

    // 3. Kurs erstellen 
    console.log('\n3. Testing Course Creation...');
    const courseResponse = await axios.post(
      `${API_URL}/courses`,
      {
        title: "TypeScript Basics",
        description: "Learn TypeScript from scratch",
        startDate: "2024-03-01T00:00:00.000Z",
        endDate: "2024-03-31T00:00:00.000Z",
        category: "Programmierung"
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    courseId = courseResponse.data.data.course._id;
    console.log('✅ Course Creation successful');

    // 4. Get alle Kurse
    console.log('\n4. Testing Get All Courses...');
    const coursesResponse = await axios.get(
      `${API_URL}/courses`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Get All Courses successful');
    console.log(`Found ${coursesResponse.data.data.courses.length} courses`);

    // 5. ATeilnehmer hinzufügen
    console.log('\n5. Testing Add Participant to Course...');
    await axios.post(
      `${API_URL}/courses/${courseId}/participants`,
      { userId },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Add Participant successful');

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
};

// Run tests
testAPI();
