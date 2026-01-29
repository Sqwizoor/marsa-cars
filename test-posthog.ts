// Read from environment
const apiKey = 'phx_ZAwxRI8pUbllRmoGoQf4iqMuyYcGrWVYtE9icS1WulgNTup';
const projectId = '301224';

async function testPostHog() {
  console.log('Testing PostHog with Project ID:', projectId);
  console.log('Using API Key:', apiKey.slice(0, 10) + '...');
  
  const eventsUrl = `https://us.posthog.com/api/projects/${projectId}/events/?limit=10`;
  console.log('\nFetching events...');
  
  try {
    const response = await fetch(eventsUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    
    if (!response.ok) {
      console.log('Error:', await response.text());
      return;
    }
    
    const data = await response.json();
    console.log('SUCCESS! Events found:', data.results?.length || 0);
    
    if (data.results && data.results.length > 0) {
      console.log('\nSample events:');
      data.results.slice(0, 5).forEach((event: any, i: number) => {
        console.log(`${i + 1}. ${event.event} - ${event.timestamp}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testPostHog();
