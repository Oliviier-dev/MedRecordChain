"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const DashboardPage: React.FC = () => {
  const { address: userAddress } = useAccount();
  const [isRegistered, setIsRegistered] = useState(false);
  const [doctorAddress, setDoctorAddress] = useState("");
  const [patientInfo, setPatientInfo] = useState({
    name: "",
    age: 0,
    phone: "",
    email: "",
  });
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);
  const [grantedDoctors, setGrantedDoctors] = useState<
    { doctorAddress: string; name: string; specialization: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const { writeContractAsync: grantAccessAsync } = useScaffoldWriteContract("PatientRegistry");
  const { writeContractAsync: revokeAccessAsync } = useScaffoldWriteContract("PatientRegistry");

  const { data: registrationStatus } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "isPatientRegistered",
    args: [userAddress],
  });

  const { data: patientData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getPatientInfo",
    args: [userAddress],
  });

  const { data: historyData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getPatientMedicalHistory",
    args: [userAddress],
  });

  const { data: grantedDoctorsData, refetch: refetchGrantedDoctorsData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getGrantedDoctorsWithDetails",
    args: [userAddress],
  });

  useEffect(() => {
    if (registrationStatus) {
      setIsRegistered(registrationStatus);
    }
    if (patientData) {
      const birthDate = new Date(Number(patientData[1]));
      const currentDate = new Date();
      const age = currentDate.getFullYear() - birthDate.getFullYear();

      setPatientInfo({
        name: patientData[0],
        age: age,
        phone: patientData[2],
        email: patientData[3],
      });
    }
    if (historyData) {
      setMedicalHistory([...historyData]);
    }
    if (grantedDoctorsData) {
      setGrantedDoctors([...grantedDoctorsData]);
    }
    setLoading(false);
  }, [registrationStatus, patientData, historyData, grantedDoctorsData]);

  const handleGrantAccess = async () => {
    if (!doctorAddress) {
      return;
    }
    try {
      await grantAccessAsync({
        functionName: "grantAccess",
        args: [doctorAddress],
      });
      refetchGrantedDoctorsData();
    } catch (error) {
      console.error("Failed to grant access:", error);
    }
  };

  const handleRevokeAccess = async () => {
    if (!doctorAddress) {
      return;
    }
    try {
      await revokeAccessAsync({
        functionName: "revokeAccess",
        args: [doctorAddress],
      });
      refetchGrantedDoctorsData();
    } catch (error) {
      console.error("Failed to revoke access:", error);
    }
  };

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

        {/* Patient Info */}
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

        {/* Medical History */}
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

        {/* Granted Doctors */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Doctors with Access</h2>
          {grantedDoctors.length > 0 ? (
            <ul className="space-y-2">
              {grantedDoctors.map((doctor, index) => (
                <li key={index} className="text-gray-600">
                  <span className="font-semibold">Doctor:</span> {doctor.name} ({doctor.specialization})<br />
                  <span className="font-semibold">Address:</span> {doctor.doctorAddress}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 italic">No doctors have been granted access.</p>
          )}
        </div>

        {/* Manage Doctor Access */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Manage Doctor Access</h2>
          <input
            type="text"
            value={doctorAddress}
            onChange={e => setDoctorAddress(e.target.value)}
            placeholder="Enter doctor's address"
            className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white text-gray-800"
          />
          <div className="flex space-x-4">
            <button
              onClick={handleGrantAccess}
              className="px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition"
            >
              Grant Access
            </button>
            <button
              onClick={handleRevokeAccess}
              className="px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition"
            >
              Revoke Access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
