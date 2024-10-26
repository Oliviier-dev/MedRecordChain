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

    struct DoctorDetails {
        address doctorAddress;
        string name;
        string specialization;
    }

    struct PatientDetails {
        address patientAddress;
        string name;
        uint256 age;
        string phone;
        string email;
    }

    mapping(address => Patient) private patients;
    mapping(address => Doctor) private doctors;
    mapping(address => mapping(address => bool)) private doctorPermissions;
    mapping(address => address[]) private grantedDoctors;
    mapping(address => address[]) private accessiblePatients;

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
        bool registeredStatus = patients[patientAddress].isRegistered;
        return registeredStatus;
    }

    // Check if the specified address is registered as a doctor
    function isDoctorRegistered(address doctorAddress) public view returns (bool) {
        bool registeredStatus = doctors[doctorAddress].isRegistered;
        return registeredStatus;
    }

    // Add a new entry to the medical history
    function addMedicalRecord(string memory _description) public {
        require(patients[msg.sender].isRegistered, "Patient is not registered.");

        // Add a new entry to the patient's medical history
        patients[msg.sender].medicalHistory.push(_description);

        emit MedicalRecordAdded(msg.sender, _description);
    }

    // Grant access to a doctor and add to the list
    function grantAccess(address _doctor) public {
        require(patients[msg.sender].isRegistered, "Patient is not registered.");
        require(doctors[_doctor].isRegistered, "Doctor is not registered.");

        if (!doctorPermissions[msg.sender][_doctor]) {
            doctorPermissions[msg.sender][_doctor] = true;
            grantedDoctors[msg.sender].push(_doctor);
            accessiblePatients[_doctor].push(msg.sender);
            emit AccessGranted(msg.sender, _doctor);
        }
    }

    // Revoke access from a doctor and remove from the list
    function revokeAccess(address _doctor) public {
        require(patients[msg.sender].isRegistered, "Patient is not registered.");
        require(doctorPermissions[msg.sender][_doctor], "Access not granted.");

        doctorPermissions[msg.sender][_doctor] = false;

        // Remove doctor from the patient's granted list
        for (uint i = 0; i < grantedDoctors[msg.sender].length; i++) {
            if (grantedDoctors[msg.sender][i] == _doctor) {
                grantedDoctors[msg.sender][i] = grantedDoctors[msg.sender][grantedDoctors[msg.sender].length - 1];
                grantedDoctors[msg.sender].pop();
                break;
            }
        }

        // Remove patient from the doctor's accessible list
        for (uint i = 0; i < accessiblePatients[_doctor].length; i++) {
            if (accessiblePatients[_doctor][i] == msg.sender) {
                accessiblePatients[_doctor][i] = accessiblePatients[_doctor][accessiblePatients[_doctor].length - 1];
                accessiblePatients[_doctor].pop();
                break;
            }
        }

        emit AccessRevoked(msg.sender, _doctor);
    }

    // Function to get the list of doctors with access
    function getGrantedDoctorsWithDetails(address patientAddress) public view returns (DoctorDetails[] memory) {
        require(patients[patientAddress].isRegistered, "Patient is not registered.");

        address[] memory doctorAddresses = grantedDoctors[patientAddress];
        DoctorDetails[] memory details = new DoctorDetails[](doctorAddresses.length);

        for (uint i = 0; i < doctorAddresses.length; i++) {
            address docAddr = doctorAddresses[i];
            details[i] = DoctorDetails({
                doctorAddress: docAddr,
                name: doctors[docAddr].name,
                specialization: doctors[docAddr].specialization
            });
        }

        return details;
    }

    // Get basic patient info for the caller
    function getPatientInfo(address patientAddress) public view returns (string memory, uint256, string memory, string memory) {
        require(patients[patientAddress].isRegistered, "Patient is not registered.");

        Patient memory patient = patients[patientAddress];
        return (patient.name, patient.age, patient.phone, patient.email);
    }

    // Get doctor's own details
    function getDoctorDetails(address doctorAddress) public view returns (string memory, string memory) {
        require(doctors[doctorAddress].isRegistered, "Doctor is not registered.");
        Doctor memory doc = doctors[doctorAddress];
        return (doc.name, doc.specialization);
    }

    // function to get list of patients who have granted access to the doctor
    function getAccessiblePatientsWithDetails(address doctorAddress) public view returns (PatientDetails[] memory) {
        require(doctors[doctorAddress].isRegistered, "Doctor is not registered.");

        address[] memory patientAddresses = accessiblePatients[doctorAddress];
        PatientDetails[] memory details = new PatientDetails[](patientAddresses.length);

        for (uint i = 0; i < patientAddresses.length; i++) {
            address patientAddr = patientAddresses[i];
            if (doctorPermissions[patientAddr][doctorAddress]) {
                Patient memory patient = patients[patientAddr];
                details[i] = PatientDetails(patientAddr, patient.name, patient.age, patient.phone, patient.email);
            }
        }

        return details;
    }

    // Function to get the medical history of a specified address
    function getPatientMedicalHistory(address patientAddress) public view returns (string[] memory) {
        require(patients[patientAddress].isRegistered, "Patient is not registered.");

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
