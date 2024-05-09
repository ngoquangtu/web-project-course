document.getElementById('form-upload').addEventListener('submit', function(event) {
    event.preventDefault();
    
    var formData = new FormData();
    var fileInput = document.getElementById('avatar');
    formData.append('avatar', fileInput.files[0]);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        document.getElementById('avatar-container').innerHTML = '<img src="' + data + '" alt="Uploaded Image">';
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
