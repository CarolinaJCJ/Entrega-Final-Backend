const container = document.getElementById('users')
fetch('api/users')
    .then(response => response.json())
    .then(data => {
        let users = ''; 
        data.payload.forEach(user => {
            users += `<li>
                        <h3>Name: ${user.first_name} ${user.last_name} </h3>
                        <h4>Email: ${user.email}</h4>
                        <div class="d-flex flex-direction-row">
                        <h4 class="me-4">Role: ${user.role}</h4>
                        <button id=${user._id} class="btn btn-info me-4"> Change role</button>
                        <button id=${user._id}Delete class="btn btn-danger"> Delete user</button>
                        </div>
                      </li>`;
        });
        container.innerHTML = users;


        data.payload.forEach(user => {
            document.getElementById(user._id).addEventListener('click', () => {
                const userId = user._id;


                fetch(`api/users/${userId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ role: user.role })
                })
                    .then(response => {
                        if (!response.ok) {

                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        Swal.fire({
                            title: 'Rol Actualizado!',
                            text: 'El usuario ha sido actualizado exitosamente.',
                            icon: 'success',
                        }).then(() => window.location.reload())

                    })
                    .catch((error) => {

                        Swal.fire({
                            title: 'Error!',
                            text: 'Hubo un error al actualizar el rol del usuario.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        })
                    });
            });

        });
        data.payload.forEach(user => {
            document.getElementById(`${user._id}Delete`).addEventListener('click', () => {

                fetch(`api/users/${document.getElementById(user._id).id}`, {
                    method: 'DELETE',
                })
                    .then(response => {
                        if (response.ok) {
                            Swal.fire({
                                title: 'Usuario eliminado',
                                text: 'El usuario ha sido eliminado exitosamente.',
                                icon: 'success',
                            }).then(() => window.location.reload())
                        }
                    })
                    .catch(error => {
                        Swal.fire({
                            title: 'Error',
                            text: 'Hubo un error al intentar eliminar el usuario.',
                            icon: 'error',
                        });
                    });
            });
        });
    });
