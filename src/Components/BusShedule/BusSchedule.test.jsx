import React from 'react';
import { render, screen, fireEvent, waitFor,act } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import BusSchedule from './BusSchedule';
import { getFirestore, getDocs, collection } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import { getAuth } from "firebase/auth";
import { jsPDF,addImage, save  } from 'jspdf';

// Mock Firebase Firestore
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({
    docs: [
      {
        id: "1",
        data: () => ({
          routeName: "Full Circuit",
          days: ["Monday", "Tuesday"],
          schedule: ["08:00", "09:00"],
          stops: ["Stop 1", "Stop 2"],
        }),
      },
      {
        id: "2",
        data: () => ({
          routeName: "Reverse",
          days: ["Monday", "Wednesday"],
          schedule: ["10:00", "11:00"],
          stops: ["Stop A", "Stop B"],
        }),
      },
    ],
  }),
}));




jest.mock("firebase/auth", () => {
  const originalModule = jest.requireActual("firebase/auth");
  return {
    ...originalModule,
    getAuth: jest.fn(() => ({
      onAuthStateChanged: jest.fn((callback) => {
        callback(null); // Mocking a logged-out user, pass a user object if you need to mock a logged-in user
      }),
    })),
  };
});


const renderComponent = () => {
  return render(
    <Router>
      <BusSchedule />
    </Router>
  );
};

// Mock html2canvas and jsPDF
jest.mock('html2canvas', () => jest.fn());
// Mock jsPDF
jest.mock('jsPDF', () => {
  const addImage = jest.fn();
  const save = jest.fn();

  return {
    jsPDF: jest.fn().mockImplementation(() => ({
      addImage,
      save,
    })),
    // These functions can be used to verify calls later
    addImage,
    save,
  };
});


describe('BusSchedule Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the Bus Schedule component', async () => {
    renderComponent();
    
    // Use getAllByText() to prevent multiple elements error
    const scheduleElements = await screen.findAllByText(/Bus Schedule/i);
    expect(scheduleElements.length).toBeGreaterThan(0);

    // Check if filter buttons are rendered
    const allButton = await screen.findByText(/ALL/i);
    expect(allButton).toBeInTheDocument();

    const fullCircuitButton = await screen.findByText(/Full Circuit/i);
    expect(fullCircuitButton).toBeInTheDocument();
  });

  test('filters bus routes correctly', async () => {
    renderComponent();

    // Click the filter button for "Full Circuit"
    const fullCircuitButton = await screen.findByText(/Full Circuit/i);
    fireEvent.click(fullCircuitButton);

    // Check if the filtered route is displayed
    const routeName = await screen.findByText(/Full Circuit/i);
    expect(routeName).toBeInTheDocument();
  });

  test('toggles filter buttons', async () => {
    renderComponent();
  
    // Click "Full Circuit" filter
    const fullCircuitButton = await screen.findByText(/Full Circuit/i);
    fireEvent.click(fullCircuitButton);
    const wjButton = await screen.findByText(/WJ/i);
    const wjButtonColor = getComputedStyle(wjButton).backgroundColor;
  
    expect(fullCircuitButton).not.toHaveStyle(wjButtonColor);
  
    // Click again to unselect
    fireEvent.click(fullCircuitButton);
    expect(fullCircuitButton).not.toHaveStyle('background-color: rgb(48, 74, 125)');
  });
  
  

  test('shows "No more buses available today" when no upcoming buses', async () => {
    renderComponent();

    // Assuming no schedules match the current time/day
    const noBusesText = await screen.findByText(/No more buses available today/i);
    expect(noBusesText).toBeInTheDocument();
  });

  test('downloads the schedule as PDF when "Download Schedule as PDF" button is clicked', async () => {
    // Mock html2canvas to resolve with a fake canvas object
    html2canvas.mockResolvedValueOnce({
      toDataURL: () => 'data:image/png;base64,some-image-data',
    });

    renderComponent();

    const downloadButton = await screen.findByText(/Download Schedule as PDF/i);
    expect(downloadButton).toBeInTheDocument();

    fireEvent.click(downloadButton);

    // Use waitFor to ensure async operations are complete
    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalled();
    });

    
  });
  test('downloads schedule as a multi-page PDF', async () => {
    // Mock html2canvas to resolve with a fake canvas object
    html2canvas.mockResolvedValueOnce({
      toDataURL: () => 'data:image/png;base64,some-image-data',
      height: 5000,
      width: 1000,
    });
  
    renderComponent();
  
    const downloadButton = await screen.findByText(/Download Schedule as PDF/i);
    fireEvent.click(downloadButton);
  
    await waitFor(() => {
      expect(html2canvas).toHaveBeenCalled();
    });
  
    
  });


  test('handles empty response from Firestore gracefully', async () => {
    // Mock Firestore with empty data
    getDocs.mockResolvedValueOnce({ docs: [] });
  
    renderComponent();
  
    const noBusesText = await screen.findByText(/No more buses available today/i);
    expect(noBusesText).toBeInTheDocument();
  });
  test('clicking "ALL" filter button resets other filters', async () => {
    renderComponent();
  
    // Click multiple filter buttons
    const fullCircuitButton = await screen.findByText(/Full Circuit/i);
    fireEvent.click(fullCircuitButton);
    const wjButton = await screen.findByText(/WJ/i);
    const wjButtonColor = getComputedStyle(wjButton).backgroundColor;

    const allButton = await screen.findByText(/ALL/i);
    fireEvent.click(allButton);
  
    // Check if "ALL" is active and other filters are reset
    // expect(allButton).toHaveStyle('background-color: rgb(48, 74, 125)');
    expect(fullCircuitButton).not.toHaveStyle(wjButtonColor);
  });
  
  

   test('updates current time every second', async () => {
    jest.useFakeTimers();

    renderComponent();

    // Get the initial time
    const initialTime = new Date().toLocaleTimeString();
    const initialTimeElement = screen.getByText(initialTime);
    expect(initialTimeElement).toBeInTheDocument();

    // Advance the timer by 1 second
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for the updated time to appear
    await waitFor(() => {
      const updatedTime = new Date().toLocaleTimeString();
      expect(screen.getByText(updatedTime)).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  test('filters bus routes with multiple selected', async () => {
    renderComponent();
  
    // Select "Full Circuit" and "Reverse"
    const fullCircuitButton = await screen.findByText(/Full Circuit/i);
    fireEvent.click(fullCircuitButton);
  
    const reverseButton = await screen.findByText(/Reverse/i);
  const wjButton = await screen.findByText(/WJ/i);

  // Get computed styles for both buttons
  const wjButtonColor = getComputedStyle(wjButton).backgroundColor;

  // Assert that the colors are different

    fireEvent.click(reverseButton);
  
    // Verify both routes are included in the filtered result
    expect(fullCircuitButton).not.toHaveStyle(wjButtonColor);
    expect(reverseButton).not.toHaveStyle(wjButtonColor);
  });
  
  
  
  
  
});
