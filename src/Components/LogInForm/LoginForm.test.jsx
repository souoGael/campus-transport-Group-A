import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginForm from './LoginForm';
import { BrowserRouter } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Mock Firebase functions
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(), // Include sendPasswordResetEmail here
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
}));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('LoginForm Component', () => {
  let mockNavigate;

  beforeEach(() => {
    mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);
  });

  test('renders the login form', () => {
    renderWithRouter(<LoginForm />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const signInButton = screen.getByText(/sign in/i);
    
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(signInButton).toBeInTheDocument();
  });

  test('allows user to toggle password visibility', () => {
    renderWithRouter(<LoginForm />);
  
    const passwordInput = screen.getByPlaceholderText(/password/i);
    
    // Query the toggle icon by data-testid
    const toggleIcon = screen.getByTestId('show-password-icon');
  
    // Initially, the password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');
  
    // Click the toggle icon to show the password
    fireEvent.click(toggleIcon);
  
    // After clicking, the password should be visible
    expect(passwordInput).toHaveAttribute('type', 'text');
  
    // Check the icon has switched to "hide password"
    const hidePasswordIcon = screen.getByTestId('hide-password-icon');
    expect(hidePasswordIcon).toBeInTheDocument();
  });

  test('displays error when login credentials are invalid', async () => {
    // Mock a rejected login attempt
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderWithRouter(
      <>
        <LoginForm />
        <ToastContainer />
      </>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'invalid@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByText(/sign in/i));
 
    // Wait for the error toast to appear
    await waitFor(() => {
      const errorToast = screen.getByText(/invalid credentials/i);
      expect(errorToast).toBeInTheDocument();
    });
  });

  test('navigates to signup page when Sign Up link is clicked', () => {
    renderWithRouter(<LoginForm />);

    fireEvent.click(screen.getByText(/sign up/i));
    expect(mockNavigate).toHaveBeenCalledWith('/Signup');
  });

  test('shows forgot password form when "Forgot password?" link is clicked', () => {
    renderWithRouter(<LoginForm />);

    fireEvent.click(screen.getByText(/forgot password/i));
    const resetPasswordButton = screen.getByText(/send reset email/i);
    expect(resetPasswordButton).toBeInTheDocument();
  });

  test('sends reset password email successfully', async () => {
    // Mock successful password reset email
    sendPasswordResetEmail.mockResolvedValueOnce();

    renderWithRouter(
      <>
        <LoginForm />
        <ToastContainer />
      </>
    );

    fireEvent.click(screen.getByText(/forgot password/i));
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByText(/send reset email/i));

    await waitFor(() => {
      const successToast = screen.getByText(/password reset email sent! check your inbox/i);
      expect(successToast).toBeInTheDocument();
    });
  });

  test('displays error when password reset email fails', async () => {
    // Mock failed password reset email
    sendPasswordResetEmail.mockRejectedValueOnce(new Error('Failed to send email'));

    renderWithRouter(
      <>
        <LoginForm />
        <ToastContainer />
      </>
    );

    fireEvent.click(screen.getByText(/forgot password/i));
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'invalid@example.com' },
    });
    fireEvent.click(screen.getByText(/send reset email/i));

    await waitFor(() => {
      const errorToast = screen.getByText(/error sending password reset email/i);
      expect(errorToast).toBeInTheDocument();
    });
  });

  test('navigates to homepage on successful login', async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: '12345' } });

    renderWithRouter(
      <>
        <LoginForm />
        <ToastContainer />
      </>
    );

    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'correctpassword' },
    });

    fireEvent.click(screen.getByText(/sign in/i));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/homepage');
    });
  });
});


