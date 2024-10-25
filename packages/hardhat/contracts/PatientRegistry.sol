// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract PatientRegistry {
    struct Patient {
        string name;
        uint256 age;
        string phone;
        string email;
        string[] medicalHistory;
        bool isRegistered;
    }
    
    struct Doctor {
        string name;
        string specialization;
        bool isRegistered;
    }

    // Mapping to store patient data by wallet address
    mapping(address => Patient) private patients;

    // Mapping to store doctor data by wallet address
    mapping(address => Doctor) private doctors;

    // Mapping to manage doctor access permissions for each patient
    mapping(address => mapping(address => bool)) private doctorPermissions;

    // Events
    event PatientRegistered(address patientAddress, string name, uint256 age);
    event DoctorRegistered(address doctorAddress, string name, string specialization);
    event HealthDetailsUpdated(address patientAddress, string phone, string email);
    event AccessGranted(address patientAddress, address doctorAddress);
    event AccessRevoked(address patientAddress, address doctorAddress);
    event MedicalRecordAdded(address indexed patientAddress, string description);

    // Register the patient with basic info (step 1)
    function registerPatient(
        string memory _name,
        uint256 _age,
        string memory _phone,
        string memory _email
    ) public {
        require(!patients[msg.sender].isRegistered, "Patient is already registered.");

        // Initialize an empty array for medical history
        string[] memory initialHistory;

        patients[msg.sender] = Patient({
            name: _name,
            age: _age,
            phone: _phone,
            email: _email,
            medicalHistory: initialHistory,
            isRegistered: true
        });

        emit PatientRegistered(msg.sender, _name, _age);
    }

    // Register a doctor with their name and specialization
    function registerDoctor(string memory _name, string memory _specialization) public {
        require(!doctors[msg.sender].isRegistered, "Doctor is already registered.");

        doctors[msg.sender] = Doctor({
            name: _name,
            specialization: _specialization,
            isRegistered: true
        });

        emit DoctorRegistered(msg.sender, _name, _specialization);
    }

    // Complete registration by adding medical history (step 2)
    function completeRegistration(string[] memory _medicalHistory) public {
        require(patients[msg.sender].isRegistered, "Patient has not registered basic info.");

        for (uint i = 0; i < _medicalHistory.length; i++) {
            patients[msg.sender].medicalHistory.push(_medicalHistory[i]);
        }

        emit HealthDetailsUpdated(msg.sender, patients[msg.sender].phone, patients[msg.sender].email);
    }

    // Check if the specified address is registered as a patient
    function isPatientRegistered(address patientAddress) public view returns (bool) {
        console.log("isPatientRegistered called for:", patientAddress);
        bool registeredStatus = patients[patientAddress].isRegistered;
        console.log("Registered status for", patientAddress, ":", registeredStatus);
        return registeredStatus;
    }

    // Check if the specified address is registered as a doctor
    function isDoctorRegistered(address doctorAddress) public view returns (bool) {
        console.log("isDoctorRegistered called for:", doctorAddress);
        bool registeredStatus = doctors[doctorAddress].isRegistered;
        console.log("Registered status for doctor", doctorAddress, ":", registeredStatus);
        return registeredStatus;
    }

    // Add a new entry to the medical history
    function addMedicalRecord(string memory _description) public {
        require(patients[msg.sender].isRegistered, "Patient is not registered.");

        // Add a new entry to the patient's medical history
        patients[msg.sender].medicalHistory.push(_description);

        emit MedicalRecordAdded(msg.sender, _description);
    }

    // Grant access to a doctor
    function grantAccess(address _doctor) public {
        require(patients[msg.sender].isRegistered, "Patient is not registered.");
        require(doctors[_doctor].isRegistered, "Doctor is not registered.");

        doctorPermissions[msg.sender][_doctor] = true;
        emit AccessGranted(msg.sender, _doctor);
    }

    // Revoke access from a doctor
    function revokeAccess(address _doctor) public {
        require(patients[msg.sender].isRegistered, "Patient is not registered.");

        doctorPermissions[msg.sender][_doctor] = false;
        emit AccessRevoked(msg.sender, _doctor);
    }

    // Get basic patient info for the caller
    function getPatientInfo(address patientAddress) public view returns (string memory, uint256, string memory, string memory) {
        require(patients[patientAddress].isRegistered, "Patient is not registered.");
        console.log("getPatientInfo called for:", patientAddress);

        Patient memory patient = patients[patientAddress];
        return (patient.name, patient.age, patient.phone, patient.email);
    }

    // Function to get the medical history of a specified address
    function getPatientMedicalHistory(address patientAddress) public view returns (string[] memory) {
        require(patients[patientAddress].isRegistered, "Patient is not registered.");
        console.log("getPatientMedicalHistory called for:", patientAddress);

        return patients[patientAddress].medicalHistory;
    }

    // Get the entire medical history of a patient if access is granted
    function getMedicalHistory(address _patient) public view returns (string[] memory) {
        require(
            msg.sender == _patient || doctorPermissions[_patient][msg.sender],
            "Not authorized to access this patient's medical history."
        );

        return patients[_patient].medicalHistory;
    }
}
