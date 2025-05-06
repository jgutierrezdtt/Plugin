import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "copilot-chat-helper" is now active!');

	// The command has been defined in the package.json file
	const disposableHelloWorld = vscode.commands.registerCommand('copilot-chat-helper.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from Copilot Chat Helper!');
	});

	context.subscriptions.push(disposableHelloWorld);

	// Registrar un comando para interactuar con el chat de Copilot
	const disposableAskCopilot = vscode.commands.registerCommand('copilotChatHelper.askCopilot', async () => {
		try {
			// Solicitar al usuario que ingrese una pregunta
			const question = await vscode.window.showInputBox({
				prompt: 'Escribe tu pregunta para Copilot',
				placeHolder: '¿Qué hace esta función?'
			});

			if (!question) {
				vscode.window.showWarningMessage('No se ingresó ninguna pregunta.');
				return;
			}

			// Mostrar un mensaje de progreso mientras se procesa la solicitud
			vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: 'Consultando a GitHub Copilot',
				cancellable: false
			}, async (progress) => {
				try {
					 // Verificar si Visual Studio Code tiene instalada la extensión de GitHub Copilot
					const extension = vscode.extensions.getExtension('GitHub.copilot');
					if (!extension) {
						throw new Error('No se encontró la extensión de GitHub Copilot. Por favor, instálala primero.');
					}

					// Crear un panel para mostrar la respuesta
					const panel = vscode.window.createWebviewPanel(
						'copilotResponse',
						'Respuesta de Copilot',
						vscode.ViewColumn.One,
						{
							enableScripts: true
						}
					);

					// Ejecutar comando de Copilot Chat (esto dependerá de las APIs disponibles públicamente)
					// Nota: Esta es una solución alternativa ya que no podemos acceder directamente a la API de Copilot
					await vscode.commands.executeCommand('github.copilot.generate', question);
					
					// Mostrar instrucciones al usuario en el panel
					panel.webview.html = getWebviewContent(
						question, 
						"La pregunta ha sido enviada a GitHub Copilot. Por favor, verifica el chat de Copilot para ver la respuesta."
					);
					
				} catch (err) {
					vscode.window.showErrorMessage(`Error: ${err instanceof Error ? err.message : String(err)}`);
				}
			});
		} catch (err) {
			vscode.window.showErrorMessage(`Error al interactuar con Copilot: ${err instanceof Error ? err.message : String(err)}`);
			console.error(err);
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
