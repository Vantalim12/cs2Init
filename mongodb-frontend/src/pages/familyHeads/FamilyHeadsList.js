// src/pages/familyHeads/FamilyHeadsList.js
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
import { familyHeadService } from "../../services/api";
import { toast } from "react-toastify";

const FamilyHeadsList = () => {
  const [familyHeads, setFamilyHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFamilyHeads, setFilteredFamilyHeads] = useState([]);

  useEffect(() => {
    fetchFamilyHeads();
  }, []);

  useEffect(() => {
    filterFamilyHeads();
  }, [searchTerm, familyHeads]);

  const fetchFamilyHeads = async () => {
    try {
      setLoading(true);
      const response = await familyHeadService.getAll();
      setFamilyHeads(response.data);
      setFilteredFamilyHeads(response.data);
    } catch (err) {
      console.error("Error fetching family heads:", err);
      setError("Failed to load family heads");
      toast.error("Failed to load family heads");
    } finally {
      setLoading(false);
    }
  };

  const filterFamilyHeads = () => {
    if (!searchTerm) {
      setFilteredFamilyHeads(familyHeads);
      return;
    }

    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = familyHeads.filter(
      (head) =>
        head.headId.toLowerCase().includes(lowercasedTerm) ||
        head.firstName.toLowerCase().includes(lowercasedTerm) ||
        head.lastName.toLowerCase().includes(lowercasedTerm) ||
        head.address.toLowerCase().includes(lowercasedTerm)
    );

    setFilteredFamilyHeads(filtered);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this family head? This action cannot be undone."
      )
    ) {
      try {
        await familyHeadService.delete(id);
        toast.success("Family head deleted successfully");
        fetchFamilyHeads();
      } catch (err) {
        console.error("Error deleting family head:", err);
        toast.error(
          err.response?.data?.error || "Failed to delete family head"
        );
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
        <p className="mt-3">Loading family heads...</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Family Heads</h2>
        <Link to="/dashboard/family-heads/add" className="btn btn-primary">
          <FaPlus className="me-2" /> Add New Family Head
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
                Total Family Heads:{" "}
                <strong>{filteredFamilyHeads.length}</strong>
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
                  <th>Registration Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFamilyHeads.map((head) => (
                  <tr key={head._id}>
                    <td>{head.headId}</td>
                    <td>{`${head.firstName} ${head.lastName}`}</td>
                    <td>
                      <Badge bg={head.gender === "Male" ? "info" : "danger"}>
                        {head.gender}
                      </Badge>
                    </td>
                    <td>{calculateAge(head.birthDate)}</td>
                    <td>{head.address}</td>
                    <td>{head.contactNumber}</td>
                    <td>
                      {new Date(head.registrationDate).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Link
                          to={`/dashboard/family-heads/view/${head.headId}`}
                          className="btn btn-sm btn-outline-primary"
                          title="View Details"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          to={`/dashboard/family-heads/edit/${head.headId}`}
                          className="btn btn-sm btn-outline-warning"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(head.headId)}
                          title="Delete"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredFamilyHeads.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No family heads found
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

export default FamilyHeadsList;
