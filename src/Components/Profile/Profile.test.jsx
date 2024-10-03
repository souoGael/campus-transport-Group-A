import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Profile from './Profile';
import { BrowserRouter } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { ToastContainer } from 'react-toastify';
import { getDoc, doc } from 'firebase/firestore';
import { auth } from '../../utils/firebase';
import axios from 'axios';

jest.mock('firebase/auth', () => ({
  sendPasswordResetEmail: jest.fn(),
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
}));

jest.mock('firebase/firestore', () => ({
  getDoc: jest.fn(),
  doc: jest.fn(),
}));

jest.mock('../../utils/firebase', () => ({
  auth: {
    onAuthStateChanged: jest.fn(),
  },
  firestore: jest.fn(),
}));

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock axios GET request for BuildingMap
    axios.get.mockResolvedValueOnce({
      data: [
        {
          item: 'Bike',
          location: 'Station A'
        }
      ]
    });
  });

  test('renders profile details correctly', async () => {
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback({ uid: '123' });
    });
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        kudu: 50,
        item: 'Bike',
        location: 'Station A',
      }),
    });

    renderWithRouter(
      <>
        <Profile />
        <ToastContainer />
      </>
    );

    expect(await screen.findByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john.doe@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/50/i)).toBeInTheDocument();
    expect(screen.getByText(/bike/i)).toBeInTheDocument();
    expect(screen.getByText(/station a/i)).toBeInTheDocument();
  });

  test('shows password reset form when "Change password" is clicked', () => {
    renderWithRouter(<Profile />);

    fireEvent.click(screen.getByText(/change password/i));
    expect(screen.getByText(/reset password/i)).toBeInTheDocument();
    expect(screen.getByText(/send reset email/i)).toBeInTheDocument();
  });

  test('sends reset password email successfully', async () => {
    sendPasswordResetEmail.mockResolvedValueOnce();

    renderWithRouter(
      <>
        <Profile />
        <ToastContainer />
      </>
    );

    fireEvent.click(screen.getByText(/change password/i));
    fireEvent.click(screen.getByText(/send reset email/i));

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'John@gmail.com');
      expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument();
    });
  });

  test('displays error when password reset email fails', async () => {
    sendPasswordResetEmail.mockRejectedValueOnce(new Error('Failed to send email'));

    renderWithRouter(
      <>
        <Profile />
        <ToastContainer />
      </>
    );

    fireEvent.click(screen.getByText(/change password/i));
    fireEvent.click(screen.getByText(/send reset email/i));

    await waitFor(() => {
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'John@gmail.com');
      expect(screen.getByText(/error sending password reset email/i)).toBeInTheDocument();
    });
  });

//   test('cancels rental successfully', async () => {
//     auth.onAuthStateChanged.mockImplementation((callback) => {
//       callback({ uid: '123' });
//     });
//     getDoc.mockResolvedValueOnce({
//       exists: () => true,
//       data: () => ({
//         firstName: 'John',
//         lastName: 'Doe',
//         email: 'john.doe@example.com',
//         kudu: 50,
//         item: 'Bike',
//         location: 'Station A',
//       }),
//     });

//     axios.post.mockResolvedValueOnce({ data: {} });

//     renderWithRouter(
//       <>
//         <Profile />
//         <ToastContainer />
//       </>
//     );

//     const cancelLink = await screen.findByText(/cancel rental/i);
//     fireEvent.click(cancelLink);

//      // Use act() to wrap the state-changing actions
//   await act(async () => {
//     fireEvent.click(cancelLink);
    
//     await waitFor(() => {
//       expect(screen.getByText(/rental cancellation successful/i)).toBeInTheDocument();
//     });
//   });
// });

  test('displays error when rental cancellation fails', async () => {
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback({ uid: '123' });
    });
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        kudu: 50,
        item: 'Bike',
        location: 'Station A',
      }),
    });

    axios.post.mockRejectedValueOnce(new Error('Error canceling rental'));

    renderWithRouter(
      <>
        <Profile />
        <ToastContainer />
      </>
    );

    const cancelLink = await screen.findByText(/cancel rental/i);
    fireEvent.click(cancelLink);

    await waitFor(() => {
      expect(screen.getByText(/error canceling rental/i)).toBeInTheDocument();
    });
  });

  test('displays error when trying to cancel rental with insufficient KuduBucks', async () => {
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback({ uid: '123' });
    });
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        kudu: 5, // Insufficient KuduBucks
        item: 'Bike',
        location: 'Station A',
      }),
    });

    renderWithRouter(
      <>
        <Profile />
        <ToastContainer />
      </>
    );

    const cancelLink = await screen.findByText(/cancel rental/i);
    fireEvent.click(cancelLink);

    await waitFor(() => {
      expect(screen.getByText(/you need more kudu bucks to rent this ride/i)).toBeInTheDocument();
    });
  });

  test('toggles password reset form visibility correctly', () => {
    renderWithRouter(<Profile />);

    // Click to open the reset password form
    fireEvent.click(screen.getByText(/change password/i));
    expect(screen.getByText(/reset password/i)).toBeInTheDocument();

    // Click to close the reset password form
    fireEvent.click(screen.getByText(/cancel/i));
    expect(screen.queryByText(/reset password/i)).not.toBeInTheDocument();
  });

  // test('navigates to homepage when handleHOME is called', () => {
  //   const mockNavigate = jest.fn();
  //   jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

  //   renderWithRouter(<Profile />);
  //   fireEvent.click(screen.getByText(/homepage/i));

  //   expect(mockNavigate).toHaveBeenCalledWith('/Homepage');
  // });

  test('renders correctly with no rental data', async () => {
    auth.onAuthStateChanged.mockImplementation((callback) => {
      callback({ uid: '123' });
    });
    getDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        kudu: 30,
      }),
    });

    renderWithRouter(
      <>
        <Profile />
        <ToastContainer />
      </>
    );

    expect(await screen.findByText(/jane doe/i)).toBeInTheDocument();
    expect(screen.getByText(/no current rental/i)).toBeInTheDocument();
  });
});
