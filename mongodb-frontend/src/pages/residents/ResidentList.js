// src/pages/residents/ResidentList.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Spinner,
  Alert,
  Badge,
  Table,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaEye, FaEdit, FaTrash } from "react-icons/fa";
import { residentService } from "../../services/api";
import { toast } from "react-toastify";

const ResidentList = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResidents, setFilteredResidents] = useState([]);

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    filterResidents();
  }, [searchTerm, residents]);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const response = await residentService.getAll();
      setResidents(response.data);
      setFilteredResidents(response.data);
    } catch (err) {
      console.error("Error fetching residents:", err);
      setError("Failed to load residents");
      toast.error("Failed to load residents");
    } finally {
      setLoading(false);
    }
  };

  const filterResidents = () => {
    if (!searchTerm) {
      setFilteredResidents(residents);
      return;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = residents.filter(
      (resident) =>
        resident.residentId.toLowerCase().includes(lowercasedTerm) ||
        resident.firstName.toLowerCase().includes(lowercasedTerm) ||
        resident.lastName.toLowerCase().includes(lowercasedTerm) ||
        resident.address.toLowerCase().includes(lowercasedTerm)
    );

    setFilteredResidents(filtered);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this resident? This action cannot be undone."
      )
    ) {
      try {
        await residentService.delete(id);
        toast.success("Resident deleted successfully");
        fetchResidents();
      } catch (err) {
        console.error("Error deleting resident:", err);
        toast.error(err.response?.data?.error || "Failed to delete resident");
      }
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading residents...</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Residents</h2>
        <Link to="/dashboard/residents/add" className="btn btn-primary">
          <FaPlus className="me-2" /> Add New Resident
        </Link>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Card className="shadow-sm">
        <Card.Body>
          <Row className="mb-4">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search by ID, name, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6} className="text-end">
              <span className="text-muted">
                Total Residents: <strong>{filteredResidents.length}</strong>
              </span>
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Address</th>
                  <th>Contact</th>
                  <th>Family Head</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.map((resident) => (
                  <tr key={resident._id}>
                    <td>{resident.residentId}</td>
                    <td>{`${resident.firstName} ${resident.lastName}`}</td>
                    <td>
                      <Badge
                        bg={resident.gender === "Male" ? "info" : "danger"}
                      >
                        {resident.gender}
                      </Badge>
                    </td>
                    <td>{calculateAge(resident.birthDate)}</td>
                    <td>{resident.address}</td>
                    <td>{resident.contactNumber || "N/A"}</td>
                    <td>
                      {resident.familyHeadId ? (
                        <Link
                          to={`/dashboard/family-heads/view/${resident.familyHeadId}`}
                        >
                          {resident.familyHeadId}
                        </Link>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link
                          to={`/dashboard/residents/view/${resident.residentId}`}
                          className="btn btn-sm btn-outline-primary"
                          title="View Details"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          to={`/dashboard/residents/edit/${resident.residentId}`}
                          className="btn btn-sm btn-outline-warning"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(resident.residentId)}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredResidents.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No residents found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ResidentList;
