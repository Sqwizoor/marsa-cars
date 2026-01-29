
const apiKey = 'phx_15sEQ1oV97qBMQ0Olm0PbJbkfvlzfGKGeGl1yx6UtBLMRsvG';
const url = `https://us.posthog.com/api/projects/`;

console.log('Fetching available projects...');

async function listProjects() {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`Status: ${response.status}`);
    
    if (!response.ok) {
        console.log('Error Text:', await response.text());
        return;
    }

    const data = await response.json();
    console.log('Projects found:', data.results.length);
    data.results.forEach((p: any) => {
        console.log(`- Name: ${p.name}, ID: ${p.id}, UUID: ${p.uuid}`);
    });

  } catch (error) {
    console.error('Connection failed:', error);
  }
}

listProjects();
