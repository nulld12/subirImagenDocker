USE portainer;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50),
  email VARCHAR(100)
);

INSERT INTO usuarios (nombre, email) VALUES
('Juan', 'juan@example.com'),
('María', 'maria@example.com');
