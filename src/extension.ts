import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Activando la extensión Copilot Chat Helper...');
	console.log('Congratulations, your extension "copilot-chat-helper" is now active!');

	// The command has been defined in the package.json file
	const disposableHelloWorld = vscode.commands.registerCommand('copilot-chat-helper.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Copilot Chat Helper!');
	});

	context.subscriptions.push(disposableHelloWorld);

	// Registrar un comando para interactuar con el chat de Copilot
	const disposableAskCopilot = vscode.commands.registerCommand('copilotChatHelper.askCopilot', async () => {
		console.log('Comando copilotChatHelper.askCopilot ejecutado.');
		try {
			console.log('Solicitando entrada del usuario...');
			// Solicitar al usuario que ingrese una pregunta
			const question = await vscode.window.showInputBox({
				prompt: 'Escribe tu pregunta para Copilot',
				placeHolder: '¿Qué hace esta función?'
			});

			if (!question) {
				console.warn('No se ingresó ninguna pregunta.');
				vscode.window.showWarningMessage('No se ingresó ninguna pregunta.');
				return;
			}

			console.log(`Pregunta ingresada: ${question}`);

			// Mostrar un mensaje de progreso mientras se procesa la solicitud
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'Consultando a GitHub Copilot',
				cancellable: false
			}, async (progress) => {
				try {
					 // Verificar si Visual Studio Code tiene instalada la extensión de GitHub Copilot
					console.log('Verificando si la extensión de GitHub Copilot está instalada...');
					const extension = vscode.extensions.getExtension('GitHub.copilot');
					if (!extension) {
						throw new Error('No se encontró la extensión de GitHub Copilot. Por favor, instálala primero.');
					}

					console.log('Extensión de GitHub Copilot encontrada. Verificando disponibilidad del comando github.copilot.generate...');
					const availableCommands = await vscode.commands.getCommands(true);
					if (!availableCommands.includes('github.copilot.generate')) {
						throw new Error('El comando github.copilot.generate no está disponible.');
					}

					console.log('Comando github.copilot.generate disponible. Creando panel de respuesta...');
					// Crear un panel para mostrar la respuesta
					const panel = vscode.window.createWebviewPanel(
						'copilotResponse',
						'Respuesta de Copilot',
						vscode.ViewColumn.One,
						{
							enableScripts: true
						}
					);

					console.log('Ejecutando comando github.copilot.generate...');
					// Ejecutar comando de Copilot Chat (esto dependerá de las APIs disponibles públicamente)
					// Nota: Esta es una solución alternativa ya que no podemos acceder directamente a la API de Copilot
					await vscode.commands.executeCommand('github.copilot.generate', question);
					console.log('Comando ejecutado con éxito. Mostrando instrucciones al usuario.');
					
					// Mostrar mensaje inicial en el panel
					panel.webview.html = getWebviewContent(
						question, 
						"Estamos intentando obtener una respuesta directamente desde GitHub Copilot. Por favor, verifica el chat de Copilot para ver la respuesta."
					);
					
				} catch (err) {
					console.error('Error durante la interacción con Copilot:', err);
					vscode.window.showErrorMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
				}
			});
		} catch (err) {
			console.error('Error al interactuar con Copilot:', err);
			vscode.window.showErrorMessage(`Error al interactuar con Copilot: ${err instanceof Error ? err.message : String(err)}`);
		}
	});

	context.subscriptions.push(disposableAskCopilot);
}

// Función para crear el contenido HTML del panel de respuesta
function getWebviewContent(question: string, response: string) {
	return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Respuesta de Copilot</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
        }
        .question {
            background-color: #f0f0f0;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .response {
            background-color: #e9f7fe;
            padding: 10px;
            border-radius: 5px;
            white-space: pre-wrap;
        }
    </style>
</head>
<body>
    <h2>Consulta</h2>
    <div class="question">
        <p>${question}</p>
    </div>
    <h2>Respuesta de Copilot</h2>
    <div class="response">
        <p>${response}</p>
    </div>
</body>
</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
