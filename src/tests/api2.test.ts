import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
let authToken: string;
let adminToken: string;
let userId: string;
let courseId: string;

const TEST_USER_EMAIL = "test@example.com";

const testAPI = async () => {
  try {
    console.log('🚀 Starting API Tests...\n');

    // 1. Admin Login
    console.log('1. Testing Admin Login...');
    const adminLoginResponse = await axios.post(`${API_URL}/users/login`, {
      email: "admin@test.com",
      password: "admin123"
    });
    adminToken = adminLoginResponse.data.data.token;
    console.log('✅ Admin Login successful\n');

    // 2. Clean up existing test user if exists
    console.log('2. Cleaning up existing test user...');
    try {
      const usersResponse = await axios.get(
        `${API_URL}/admin/users`,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      
      const existingUser = usersResponse.data.data.users.find(
        (user: any) => user.email === TEST_USER_EMAIL
      );
      
      if (existingUser) {
        await axios.delete(
          `${API_URL}/admin/users/${existingUser._id}`,
          {
            headers: { Authorization: `Bearer ${adminToken}` }
          }
        );
        console.log('✅ Existing test user deleted\n');
      } else {
        console.log('✅ No existing test user found\n');
      }
    } catch (error) {
      console.error('❌ Error during user cleanup:', error);
    }

    // 3. Register New User
    console.log('3. Testing User Registration...');
    const registerResponse = await axios.post(`${API_URL}/users/register`, {
      email: TEST_USER_EMAIL,
      password: "password123",
      firstName: "John",
      lastName: "Doe"
    });
    userId = registerResponse.data.data.user.id;
    authToken = registerResponse.data.data.token;
    console.log('✅ User Registration successful\n');

    // 4. Get User Profile
    console.log('4. Testing Get User Profile...');
    const profileResponse = await axios.get(
      `${API_URL}/users/profile`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Get User Profile successful\n');

    // 5. Admin: Create Test Courses
    console.log('5. Testing Course Creation (Admin)...');
    const testCourses = [
      {
        title: "TypeScript Masterclass",
        description: "Advanced TypeScript Programming",
        startDate: "2024-03-01T00:00:00.000Z",
        endDate: "2024-03-31T00:00:00.000Z",
        category: "Programmierung",
        maxParticipants: 20
      },
      {
        title: "UI/UX Design Basics",
        description: "Learn design principles",
        startDate: "2024-04-01T00:00:00.000Z",
        endDate: "2024-04-30T00:00:00.000Z",
        category: "Design",
        maxParticipants: 15
      },
      {
        title: "Business Analytics",
        description: "Data-driven decision making",
        startDate: "2024-03-15T00:00:00.000Z",
        endDate: "2024-04-15T00:00:00.000Z",
        category: "Business",
        maxParticipants: 30
      },
      {
        title: "Advanced JavaScript",
        description: "Modern JavaScript features",
        startDate: "2024-03-01T00:00:00.000Z",
        endDate: "2024-03-31T00:00:00.000Z",
        category: "Programmierung",
        maxParticipants: 25
      }
    ];

    for (const courseData of testCourses) {
      await axios.post(
        `${API_URL}/admin/courses`,
        courseData,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
    }
    
    // Save the last course ID for later tests
    const lastCourseResponse = await axios.post(
      `${API_URL}/admin/courses`,
      {
        title: "Final Test Course",
        description: "This course will be used for specific tests",
        startDate: "2024-05-01T00:00:00.000Z",
        endDate: "2024-05-31T00:00:00.000Z",
        category: "Sonstiges",
        maxParticipants: 15
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    courseId = lastCourseResponse.data.data.course._id;
    console.log('✅ Course Creation successful\n');

    // 6. Get All Courses with Search and Filters
    console.log('6. Testing Get All Courses with Search and Filters...');
    
    // 6.1 Test search
    const searchResponse = await axios.get(
      `${API_URL}/courses?search=TypeScript`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Search courses successful');
    console.log(`Found ${searchResponse.data.data.courses.length} courses matching search\n`);

    // 6.2 Test category filter
    const categoryResponse = await axios.get(
      `${API_URL}/courses?category=Programmierung`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Category filter successful');
    console.log(`Found ${categoryResponse.data.data.courses.length} courses in category\n`);

    // 6.3 Test date filter
    const dateResponse = await axios.get(
      `${API_URL}/courses?startDate=2024-03-01&endDate=2024-03-31`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Date filter successful');
    console.log(`Found ${dateResponse.data.data.courses.length} courses in date range\n`);

    // 6.4 Test combined filters
    const combinedResponse = await axios.get(
      `${API_URL}/courses?search=TypeScript&category=Programmierung&startDate=2024-03-01`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Combined filters successful');
    console.log(`Found ${combinedResponse.data.data.courses.length} courses matching all criteria\n`);

    // 7. Get Course by ID
    console.log('7. Testing Get Course by ID...');
    const courseDetailResponse = await axios.get(
      `${API_URL}/courses/${courseId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Get Course by ID successful\n');

    // 8. User Join Course
    console.log('8. Testing User Join Course...');
    await axios.post(
      `${API_URL}/courses/${courseId}/join`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Join Course successful\n');

    // 9. Get User's Courses
    console.log('9. Testing Get User\'s Courses...');
    const userCoursesResponse = await axios.get(
      `${API_URL}/courses/my-courses`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Get User\'s Courses successful');
    console.log(`Found ${userCoursesResponse.data.data.courses.length} enrolled courses\n`);

    // 10. User Leave Course
    console.log('10. Testing User Leave Course...');
    await axios.post(
      `${API_URL}/courses/${courseId}/leave`,
      {},
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    console.log('✅ Leave Course successful\n');

    // 11. Admin: Update Course
    console.log('11. Testing Course Update (Admin)...');
    const updatedCourseData = {
      title: "Updated TypeScript Masterclass",
      description: "Updated Course Description",
      startDate: "2024-05-01T00:00:00.000Z",
      endDate: "2024-05-31T00:00:00.000Z",
      category: "Programmierung",
      maxParticipants: 25
    };
    await axios.put(
      `${API_URL}/admin/courses/${courseId}`,
      updatedCourseData,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    console.log('✅ Course Update successful\n');

    // 12. Admin: Get All Users
    console.log('12. Testing Get All Users (Admin)...');
    const usersResponse = await axios.get(
      `${API_URL}/admin/users`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    console.log('✅ Get All Users successful');
    console.log(`Found ${usersResponse.data.data.users.length} users\n`);

    // 13. Test Authorization Failures
    console.log('13. Testing Authorization Failures...');
    try {
      // Try to access admin endpoint with regular user token
      await axios.post(
        `${API_URL}/admin/courses`,
        testCourses[0],
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('✅ Admin authorization check working correctly\n');
      }
    }

    // 14. Clean Up - Admin: Delete All Test Courses
    console.log('14. Testing Course Deletion (Admin)...');
    const allCoursesResponse = await axios.get(
      `${API_URL}/courses`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    
    for (const course of allCoursesResponse.data.data.courses) {
      await axios.delete(
        `${API_URL}/admin/courses/${course._id}`,
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
    }
    console.log('✅ All test courses deleted successfully\n');

    // 15. Clean Up - Admin: Delete Test User
    console.log('15. Testing User Deletion (Admin)...');
    await axios.delete(
      `${API_URL}/admin/users/${userId}`,
      {
        headers: { Authorization: `Bearer ${adminToken}` }
      }
    );
    console.log('✅ User Deletion successful\n');

    console.log('🎉 All tests completed successfully!');

  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Run tests
testAPI();
