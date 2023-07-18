import React, { useState, useEffect } from 'react';
import { set, ref, onValue, remove, update } from 'firebase/database';
import './App.css';
import { db } from './firebase';
import { uid } from 'uid';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Table, Form, Button, Modal } from 'react-bootstrap';
import { FaTrash, FaEdit } from 'react-icons/fa';

function App() {
  const [titulo, setTitulo] = useState('');
  const [Autor, setAutor] = useState('');
  const [genres, setGenres] = useState([
    'Romance',
    'Ficção Científica',
    'Fantasia',
    'Mistério',
    'Suspense',
    'Terror',
    'Aventura',
    'Biografia',
    'História',
  ]);
  const [genre, setGenre] = useState('');
  const [livros, setLivros] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [tempUuid, setTempUuid] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [showDataModal, setShowDataModal] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [invalidFields, setInvalidFields] = useState([]);
  const [showSuccessAddModal, setShowSuccessAddModal] = useState(false);
  const [showSuccessUpdateModal, setShowSuccessUpdateModal] = useState(false);
  const [showSuccessDeleteModal, setShowSuccessDeleteModal] = useState(false);

  const handleTodoChange = (e) => {
    setTitulo(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setAutor(e.target.value);
  };

  const handleGenreChange = (e) => {
    setGenre(e.target.value);
  };

  // read
  useEffect(() => {
    onValue(ref(db), (snapshot) => {
      setLivros([]);
      const data = snapshot.val();
      if (data !== null) {
        Object.values(data).map((todo) => {
          setLivros((oldArray) => [...oldArray, todo]);
        });
      }
    });
  }, []);

  // write
  const writeToDatabase = () => {
    const trimmedTitulo = modalTitulo.trim();
    const trimmedAutor = modalDescription.trim();
    const trimmedGenero = genre.trim();

    if (!trimmedTitulo || !trimmedAutor || !trimmedGenero) {
      setMensagemErro('Preencha todos os campos');
      setInvalidFields(['formTodo', 'formDescription', 'formGenre']);
      return;
    }

    const titleExists = livros.some((todo) => todo.todo === trimmedTitulo);

    if (titleExists) {
      setMensagemErro('O título já existe. Por favor, escolha um título diferente.');
      return;
    }

    const newUuid = uid();
    set(ref(db, `/${newUuid}`), {
      todo: trimmedTitulo,
      description: trimmedAutor,
      genre: trimmedGenero,
      uuid: newUuid,
    });
    setModalTitulo('');
    setModalDescription('');
    setGenre('');
    setShowModal(false);
    setShowSuccessAddModal(true);
    setMensagemErro('');
    setInvalidFields([]);
  };

  // update
  const handleUpdate = (todo) => {
    setIsEdit(true);
    setTempUuid(todo.uuid);
    setModalTitulo(todo.todo);
    setModalDescription(todo.description);
    setGenre(todo.genre);
    setShowModal(true);
  };

  const handleSubmitChange = () => {
    const trimmedTitulo = modalTitulo.trim();
    const trimmedAutor = modalDescription.trim();
    const trimmedGenero = genre.trim();

    if (!trimmedTitulo || !trimmedAutor || !trimmedGenero) {
      setMensagemErro('Preencha todos os campos');
      setInvalidFields(['formTodo', 'formDescription', 'formGenre']);
      return;
    }

    const titleExists = livros.some((todo) => todo.todo === trimmedTitulo && todo.uuid !== tempUuid);

    if (titleExists) {
      setMensagemErro('O título já existe. Por favor, escolha um título diferente.');
      return;
    }

    update(ref(db, `/${tempUuid}`), {
      todo: trimmedTitulo,
      description: trimmedAutor,
      genre: trimmedGenero,
      uuid: tempUuid,
    });

    setModalTitulo('');
    setModalDescription('');
    setGenre('');
    setIsEdit(false);
    setShowModal(false);
    setShowSuccessUpdateModal(true);
    setMensagemErro('');
    setInvalidFields([]);
  };

  // delete
  const handleDelete = (todo) => {
    setTempUuid(todo.uuid);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirmation = () => {
    remove(ref(db, `/${tempUuid}`))
      .then(() => {
        setShowDeleteModal(false);
        setShowSuccessDeleteModal(true);
      })
      .catch((error) => {
        console.log('Erro ao excluir:', error);
      });
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalTitulo('');
    setModalDescription('');
    setGenre('');
    setIsEdit(false);
    setMensagemErro('');
    setInvalidFields([]);
  };

  const handleFieldClick = (data) => {
    setSelectedData(data);
    setShowDataModal(true);
  };

  const handleCloseDataModal = () => {
    setShowDataModal(false);
  };

  const handleInputChange = (field) => {
    if (invalidFields.includes(field)) {
      setInvalidFields(invalidFields.filter((f) => f !== field));
    }
  };

  const handleSuccessAddModalClose = () => {
    setShowSuccessAddModal(false);
  };

  const handleSuccessUpdateModalClose = () => {
    setShowSuccessUpdateModal(false);
  };

  const handleSuccessDeleteModalClose = () => {
    setShowSuccessDeleteModal(false);
  };

  return (
    <div className="App">
      <h1>CRUD Livro</h1>
      <div className="button-container d-flex justify-content-end">
        <Button variant="success" onClick={handleOpenModal}>
          Adicionar Livro
        </Button>
      </div>

      <div className="table-container">
        <Table className="App-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Gênero</th>
              <th>Ver Dados</th>
              <th>Editar</th>
              <th>Apagar</th>
            </tr>
          </thead>
          <tbody>
            {livros.map((todo, index) => (
              <tr
                key={todo.uuid}
                className={index % 2 === 0 ? 'light-gray-row' : 'white-row'}
                onClick={() => {}} // Não faz nada ao clicar na linha, já que o modal de sucesso será acionado ao excluir
              >
                <td>{todo.todo}</td>
                <td>{todo.description}</td>
                <td>{todo.genre}</td>
                <td>
                  <Button variant="info" onClick={() => handleFieldClick(todo)}>
                    Ver
                  </Button>
                </td>
                <td>
                  <Button variant="primary" onClick={() => handleUpdate(todo)}>
                    <FaEdit />
                  </Button>
                </td>
                <td>
                  <Button variant="danger" onClick={() => handleDelete(todo)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEdit ? 'Editar Livro' : 'Adicionar Livro'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formTodo">
              <Form.Label className={`form-label ${invalidFields.includes('formTodo') ? 'text-danger' : ''}`}>
                Título*
              </Form.Label>
              <Form.Control
                type="text"
                value={modalTitulo}
                onChange={(e) => setModalTitulo(e.target.value)}
                onInput={() => handleInputChange('formTodo')}
                className={`form-control ${invalidFields.includes('formTodo') ? 'is-invalid' : ''}`}
              />
              
            </Form.Group>

            <Form.Group controlId="formDescription">
              <div className='autor-label'>
              <Form.Label className={`form-label ${invalidFields.includes('formDescription') ? 'text-danger' : ''}`}>
                Autor*
              </Form.Label>
              </div>
              <Form.Control
                type="text"
                value={modalDescription}
                onChange={(e) => setModalDescription(e.target.value)}
                onInput={() => handleInputChange('formDescription')}
                className={`form-control ${invalidFields.includes('formDescription') ? 'is-invalid' : ''}`}
              />
              
            </Form.Group>

            <Form.Group controlId="formGenre">
            <div className='autor-label'>
              <Form.Label className={`form-label ${invalidFields.includes('formGenre') ? 'text-danger' : ''}`}>
                Gênero*
              </Form.Label>
              </div>
              <Form.Select
                value={genre}
                onChange={handleGenreChange}
                onInput={() => handleInputChange('formGenre')}
                className={`form-control ${invalidFields.includes('formGenre') ? 'is-invalid' : ''}`}
              >
                <option value="">Selecione o gênero</option>
                {genres.map((genre) => (
                  <option value={genre} key={genre}>
                    {genre}
                  </option>
                ))}
              </Form.Select>
              
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          {isEdit ? (
            <>
              <Button variant="success" onClick={handleSubmitChange}>
                Salvar
              </Button>
              <Button variant="secondary" onClick={handleCloseModal}>
                Fechar
              </Button>
            </>
          ) : (
            <>
              <Button variant="success" onClick={writeToDatabase}>
                Adicionar Livro
              </Button>
              <Button variant="secondary" onClick={handleCloseModal}>
                Fechar
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Deseja realmente excluir os dados?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleDeleteConfirmation}>
            Excluir
          </Button>
          <Button variant="secondary" onClick={handleCloseDeleteModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDataModal} onHide={handleCloseDataModal}>
        <Modal.Header closeButton>
          <Modal.Title>Dados do Livro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedData && (
            <>
              <p>Título: {selectedData.todo}</p>
              <p>Autor: {selectedData.description}</p>
              <p>Gênero: {selectedData.genre}</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDataModal}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Sucesso ao Adicionar */}
      <Modal show={showSuccessAddModal} onHide={handleSuccessAddModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sucesso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Livro adicionado com sucesso!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSuccessAddModalClose}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Sucesso ao Editar */}
      <Modal show={showSuccessUpdateModal} onHide={handleSuccessUpdateModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sucesso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Livro atualizado com sucesso!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSuccessUpdateModalClose}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Sucesso ao Excluir */}
      <Modal show={showSuccessDeleteModal} onHide={handleSuccessDeleteModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Sucesso</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Livro excluído com sucesso!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleSuccessDeleteModalClose}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
