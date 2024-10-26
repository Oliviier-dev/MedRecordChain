"use client";

import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const DoctorDashboard: React.FC = () => {
  const { address: doctorAddress } = useAccount();
  const [doctorInfo, setDoctorInfo] = useState({
    name: "",
    specialization: "",
  });
  const [accessiblePatients, setAccessiblePatients] = useState<
    { patientAddress: string; name: string; age: number; phone: string; email: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Fetch doctor's own details
  const { data: doctorDetailsData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getDoctorDetails",
    args: [doctorAddress],
  });

  // Fetch patients who granted access to this doctor
  const { data: accessiblePatientsData } = useScaffoldReadContract({
    contractName: "PatientRegistry",
    functionName: "getAccessiblePatientsWithDetails",
    args: [doctorAddress],
  });

  useEffect(() => {
    if (doctorDetailsData) {
      setDoctorInfo({
        name: doctorDetailsData[0],
        specialization: doctorDetailsData[1],
      });
    }

    if (accessiblePatientsData) {
      const formattedPatients = accessiblePatientsData.map(patient => {
        const birthDate = new Date(Number(patient.age));
        const currentDate = new Date();
        const age = currentDate.getFullYear() - birthDate.getFullYear();

        return {
          ...patient,
          age: age,
        };
      });
      setAccessiblePatients(formattedPatients);
    }

    setLoading(false);
  }, [doctorDetailsData, accessiblePatientsData]);

  if (loading) return <p className="text-center mt-20 text-indigo-600 font-semibold">Loading...</p>;

  return (
    <div className="p-8 bg-gradient-to-r from-indigo-50 to-indigo-100 min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-8 shadow-2xl rounded-lg border border-gray-200">
        <h1 className="text-3xl font-extrabold text-indigo-600 text-center mb-6">Doctor Dashboard</h1>

        {/* Doctor's Own Info */}
        {doctorInfo.name ? (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Doctor Information</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-semibold text-indigo-500">Name:</span> {doctorInfo.name}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold text-indigo-500">Specialization:</span> {doctorInfo.specialization}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">No doctor information available.</p>
        )}

        {/* Accessible Patients */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Patients you have access for:</h2>
          {accessiblePatients.length > 0 ? (
            <ul className="space-y-4">
              {accessiblePatients.map((patient, index) => (
                <li key={index} className="p-4 border rounded-md text-gray-600 bg-indigo-50">
                  <p>
                    <span className="font-semibold">Name:</span> {patient.name}
                  </p>
                  <p>
                    <span className="font-semibold">Age:</span> {patient.age}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span> {patient.phone}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {patient.email}
                  </p>
                  <p>
                    <span className="font-semibold">Address:</span> {patient.patientAddress}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500 italic">No patients have granted you access.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
