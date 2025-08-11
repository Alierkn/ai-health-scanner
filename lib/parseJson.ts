export interface HealthAnalysis {
  score: number;
  pros: string[];
  cons: string[];
}

export function parseHealthAnalysis(response: any): HealthAnalysis {
  let jsonText = '';
  
  try {
    // Try to get from output_text first
    if (response.output_text) {
      jsonText = response.output_text;
    } else if (response.output && Array.isArray(response.output)) {
      // Combine content from output array
      jsonText = response.output
        .map((item: any) => item.content?.map((c: any) => c.text).join('') || '')
        .join('');
    } else if (typeof response === 'string') {
      jsonText = response;
    } else {
      jsonText = JSON.stringify(response);
    }

    // Clean up code fences
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Try to parse directly
    try {
      const parsed = JSON.parse(jsonText);
      return validateAndClamp(parsed);
    } catch {
      // Try to extract JSON object with regex
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return validateAndClamp(parsed);
      }
      throw new Error('No valid JSON found');
    }
  } catch (error) {
    console.error('Failed to parse health analysis:', error);
    // Return fallback
    return {
      score: 5,
      pros: ['Unable to analyze'],
      cons: ['Please try again']
    };
  }
}

function validateAndClamp(data: any): HealthAnalysis {
  return {
    score: Math.max(1, Math.min(10, Math.floor(data.score || 5))),
    pros: Array.isArray(data.pros) ? data.pros.slice(0, 5) : ['No pros available'],
    cons: Array.isArray(data.cons) ? data.cons.slice(0, 5) : ['No cons available']
  };
}
