import React from "react";
import { render, fireEvent, screen, act } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import SignUpForm from "./SignupForm";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { ToastContainer } from "react-toastify";
import { auth } from "../../utils/firebase";

// Mock Firebase functions
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  getAuth: jest.fn(() => ({ currentUser: { uid: "test-uid" } })),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  setDoc: jest.fn(),
  doc: jest.fn(() => "mockDocRef"), // Mock doc function to return a mock reference
}));

// Mock navigate from react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("SignUpForm Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should display validation error for weak password", async () => {
    render(
      <Router>
        <SignUpForm />
        <ToastContainer />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText("First name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Last name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "weak" }, // Weak password
    });

    fireEvent.click(screen.getByText("Sign up"));

    expect(
      await screen.findByText(
        "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character."
      )
    ).toBeInTheDocument();
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("should handle successful signup", async () => {
    createUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: "123" },
    });
    sendEmailVerification.mockResolvedValue();
    setDoc.mockResolvedValue();

    await act(async () => {
      render(
        <Router>
          <SignUpForm />
          <ToastContainer />
        </Router>
      );
    });

    fireEvent.change(screen.getByPlaceholderText("First name"), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByPlaceholderText("Last name"), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john.doe@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "StrongPass1!" },
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Sign up"));
    });

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      auth,
      "john.doe@example.com",
      "StrongPass1!"
    );
    // expect(sendEmailVerification).toHaveBeenCalled();
    // expect(setDoc).toHaveBeenCalledWith("mockDocRef", {
    //   firstName: "John",
    //   lastName: "Doe",
    //   email: "john.doe@example.com",
    // });
    expect(mockNavigate).toHaveBeenCalledWith("/", { state: { success: true } });

    expect(
      await screen.findByText("Account created successfully! Please verify your email.")
    ).toBeInTheDocument();
  });

  it("navigates to the login page when 'Log In' is clicked", () => {
    render(
      <Router>
        <SignUpForm />
      </Router>
    );

    fireEvent.click(screen.getByText("Log In"));

    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});


