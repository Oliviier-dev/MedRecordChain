"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth/useScaffoldReadContract";

const DashboardPage: React.FC = () => {
  const { address: userAddress } = useAccount();
  console.log("Connected address in DashboardPage:", userAddress);

  const [isRegistered, setIsRegistered] = useState(false);
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: 0,
    phone: "",
    email: "",
  });
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if the patient is registered
  const { data: registrationStatus, isError: isRegistrationError } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "isPatientRegistered",
    args: [userAddress],
  });

  // Load patient information
  const {
    data: patientData,
    isError: isPatientError,
    isLoading: isPatientLoading,
  } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getPatientInfo",
    args: [userAddress],
  });

  // Load medical history
  const {
    data: historyData,
    isError: isHistoryError,
    isLoading: isHistoryLoading,
  } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getPatientMedicalHistory",
    args: [userAddress],
  });

  useEffect(() => {
    console.log("Registration Status:", registrationStatus);
    console.log("Patient Data:", patientData);
    console.log("Medical History Data:", historyData);

    if (registrationStatus !== undefined && !isRegistrationError) {
      setIsRegistered(registrationStatus);
    }

    if (patientData && !isPatientError) {
      setPatientInfo({
        name: patientData[0],
        age: Number(patientData[1]),
        phone: patientData[2],
        email: patientData[3],
      });
    }
    if (historyData && !isHistoryError) {
      setMedicalHistory([...historyData]);
    }

    setLoading(isPatientLoading || isHistoryLoading || registrationStatus === undefined);
  }, [
    registrationStatus,
    patientData,
    historyData,
    isPatientError,
    isHistoryError,
    isPatientLoading,
    isHistoryLoading,
    isRegistrationError,
  ]);

  if (loading) return <p className="text-center mt-20 text-indigo-600 font-semibold">Loading...</p>;

  if (!isRegistered) {
    return (
      <p className="text-center mt-20 text-red-600 font-semibold">
        Error: This wallet address is not registered. Please register to view the dashboard.
      </p>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full bg-white p-8 shadow-2xl rounded-lg border border-gray-200">
        <h1 className="text-3xl font-extrabold text-indigo-600 text-center mb-6">Patient Dashboard</h1>

        {patientInfo.name ? (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Patient Information</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-semibold text-indigo-500">Name:</span> {patientInfo.name}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-indigo-500">Age:</span> {patientInfo.age}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-indigo-500">Phone:</span> {patientInfo.phone}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-indigo-500">Email:</span> {patientInfo.email}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">No patient information available.</p>
        )}

        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Medical History</h2>
          {medicalHistory.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              {medicalHistory.map((entry, index) => (
                <li key={index} className="text-gray-600">
                  {entry}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 italic">No medical history available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
