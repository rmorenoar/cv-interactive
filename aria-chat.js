/**
 * Aria Chat Widget - AI Portfolio Assistant
 * Author: Roberto Moreno Araneda
 * Integrated with RECRUITER_AI_KNOWLEDGE_BASE
 * Bilingual: English / Spanish
 */
(function() {
'use strict';

// ============================================================
// KNOWLEDGE BASE (embedded for zero-cost static deployment)
// ============================================================
const ARIA_KB = {
  intro: "Kia ora! I'm Aria, Roberto Moreno's AI portfolio assistant. How can I help you today?",
  intro_es: "Kia ora! Soy Aria, la asistente IA del portafolio de Roberto Moreno. En que puedo ayudarte?",
  conversation_starters: [
    "Tell me about Roberto",
    "AWS experience?",
    "Why New Zealand?",
    "What is Kaitiaki?",
    "When can he start?",
    "Schedule interview"
  ],
  questions: [

    {
      id: "intro",
      triggers: ["tell me about yourself","introduce yourself","who is roberto","about the candidate","about roberto","tell me about roberto"],
      answer_en: "Roberto is a senior cloud engineer with 8 years of hands-on AWS experience at national scale. He currently governs AWS infrastructure for Chile's Ministry of Health \u2014 1,800 Lambda functions, 76 million monthly API requests, 6 organizational units. He built this capability from scratch during a crisis migration in 2020. He is seeking long-term opportunities in New Zealand.",
      answer_es: "Roberto es un ingeniero cloud senior con 8 a\u00f1os de experiencia pr\u00e1ctica en AWS a escala nacional. Actualmente gobierna la infraestructura AWS del Ministerio de Salud de Chile \u2014 1,800 funciones Lambda, 76 millones de requests mensuales, 6 unidades organizacionales."
    },
    {
      id: "why_nz",
      triggers: ["why new zealand","why nz","why move","relocation motivation","nueva zelanda"],
      answer_en: "It's a family decision. Roberto and his wife value outdoor lifestyle and a safe environment to raise their family. They connected with Aotearoa's culture, landscapes, and values of integration. This is a long-term commitment, not a short-term opportunity.",
      answer_es: "Es una decisi\u00f3n familiar. Roberto y su esposa valoran el estilo de vida outdoor y un entorno seguro para criar a su familia. Se conectaron con la cultura, paisajes y valores de integraci\u00f3n de Aotearoa. Es un compromiso a largo plazo."
    },
    {
      id: "aws_experience",
      triggers: ["aws experience","how did you learn aws","cloud experience","aws"],
      answer_en: "Not from courses \u2014 from necessity. In 2020, during the pandemic, the physical infrastructure couldn't handle the new system. They migrated to AWS with no external consultant. Roberto learned on the job, managing production systems for national health services. That's 6 years of real production experience.",
      answer_es: "No de cursos \u2014 de la necesidad. En 2020, durante la pandemia, la infraestructura f\u00edsica no aguant\u00f3. Migraron a AWS sin consultor externo. Roberto aprendi\u00f3 en producci\u00f3n, gestionando sistemas de salud nacional."
    },

    {
      id: "current_role",
      triggers: ["current role","what do you do now","responsibilities","rol actual"],
      answer_en: "Infrastructure and Operational Continuity Lead at Chile's Ministry of Health. He governs 6 AWS organizational units, controls production deployments through CAB processes, manages security and compliance, reduces technical debt, and optimizes costs. His team grew from 2 to 12 people.",
      answer_es: "L\u00edder de Infraestructura y Continuidad Operacional en el Ministerio de Salud de Chile. Gobierna 6 unidades organizacionales AWS, controla despliegues a producci\u00f3n mediante procesos CAB, gestiona seguridad y cumplimiento."
    },
    {
      id: "pressure",
      triggers: ["handle pressure","stressful situation","crisis","challenge","presion"],
      answer_en: "Real example: In 2018, Chile's SANNA Law needed a processing system in one month. No system, no team, no budget. Roberto built the workflow using Google tools for 28 branches nationwide. It was meant for 3 months but ran 6 years.",
      answer_es: "Ejemplo real: En 2018, la Ley SANNA necesitaba un sistema en un mes. Sin sistema, equipo ni presupuesto. Roberto construy\u00f3 el flujo con herramientas Google para 28 sucursales. Era para 3 meses pero funcion\u00f3 6 a\u00f1os."
    },
    {
      id: "teamwork",
      triggers: ["team","teamwork","leadership","collaboration","equipo","liderazgo"],
      answer_en: "Absolutely. He coordinated an organic team that grew from 2 to 12 people. His role was articulating between different needs while also executing hands-on. His philosophy: everyone needs to be aligned before deployment.",
      answer_es: "Absolutamente. Coordin\u00f3 un equipo org\u00e1nico que creci\u00f3 de 2 a 12 personas. Su rol fue articular entre distintas necesidades mientras tambi\u00e9n ejecutaba."
    },
    {
      id: "availability",
      triggers: ["when can he start","availability","start date","disponibilidad","cuando puede empezar"],
      answer_en: "Roberto is available from July 2026. He requires AEWV sponsorship \u2014 DevOps Engineer is on the Green List Tier 1. His NZQA Level 7 qualification is already recognized.",
      answer_es: "Roberto est\u00e1 disponible desde julio 2026. Requiere sponsorship AEWV \u2014 DevOps Engineer est\u00e1 en el Green List Tier 1. Su t\u00edtulo NZQA Level 7 ya est\u00e1 reconocido."
    },

    {
      id: "salary",
      triggers: ["salary","compensation","rate","how much","sueldo","remuneracion"],
      answer_en: "For full-time roles: NZD 120,000\u2013160,000 annually, negotiable based on role and benefits. For contract work: $150\u2013200/hour.",
      answer_es: "Para roles full-time: NZD 120,000\u2013160,000 anuales, negociable seg\u00fan rol y beneficios. Para contrato: $150\u2013200/hora."
    },
    {
      id: "visa",
      triggers: ["visa","work rights","sponsorship","can he work in nz","aewv"],
      answer_en: "Roberto requires an Accredited Employer Work Visa (AEWV) with employer sponsorship. DevOps Engineer is on NZ Green List Tier 1, which streamlines the process. His qualification is already recognized by NZQA as a Bachelor's degree at Level 7.",
      answer_es: "Roberto requiere una AEWV con patrocinio del empleador. DevOps Engineer est\u00e1 en el Green List Tier 1. Su t\u00edtulo ya est\u00e1 reconocido por NZQA como Bachelor's degree Level 7."
    },
    {
      id: "kaitiaki_project",
      triggers: ["kaitiaki","portfolio project","what did he build","que construyo"],
      answer_en: "Kaitiaki Mataara Kapua \u2014 Guardian Vigilant of the Cloud. Roberto consolidated real operational tools into a single production-ready platform. 8 modules, 25+ AWS services, React 19 frontend, Python backend, deploys in 15 minutes, costs $25\u201345/month. Not a tutorial project \u2014 real tools consolidated into one app.",
      answer_es: "Kaitiaki Mataara Kapua \u2014 Guardi\u00e1n Vigilante de la Nube. Roberto consolid\u00f3 herramientas operacionales reales en una plataforma. 8 m\u00f3dulos, 25+ servicios AWS, React 19, Python backend, se despliega en 15 min, cuesta $25\u201345/mes."
    },
    {
      id: "scale",
      triggers: ["scale","how big","numbers","metrics","metricas","numeros"],
      answer_en: "Current production: 1,824 Lambda functions, 76M monthly API requests, 82 active APIs, 6 AWS organizational units, 900,000+ annual health transactions, 90+ repositories under security governance. DRP protects 19M weekly transactions with 99.95% uptime.",
      answer_es: "Producci\u00f3n actual: 1,824 funciones Lambda, 76M requests mensuales, 82 APIs activas, 6 OUs AWS, 900,000+ transacciones anuales de salud, 90+ repositorios bajo gobernanza de seguridad."
    },

    {
      id: "lambda_experience",
      triggers: ["lambda experience","lambda functions","serverless functions"],
      answer_en: "1,824 Lambda functions in production handling 76 million monthly requests. This is the primary compute architecture for Chile's national health system.",
      answer_es: "1,824 funciones Lambda en producci\u00f3n manejando 76 millones de requests mensuales. Es la arquitectura de c\u00f3mputo principal del sistema nacional de salud."
    },
    {
      id: "multi_account",
      triggers: ["multi-account","control tower","organizational units","ous"],
      answer_en: "AWS Control Tower with 6 Organizational Units: Logs, Development, Test/QA, Production, Audit, and Root. Service Control Policies enforce security boundaries. Migrated from a flat structure to this governed model.",
      answer_es: "AWS Control Tower con 6 Unidades Organizacionales: Logs, Desarrollo, Test/QA, Producci\u00f3n, Auditor\u00eda y Root. SCPs para l\u00edmites de seguridad."
    },
    {
      id: "costs",
      triggers: ["aws costs","cost optimization","cost management","save money","costos"],
      answer_en: "Cost optimization through right-sizing, tag-based resource scheduling (automated on/off), reducing technical debt, and governance. Kaitiaki costs $25\u201345/month versus $10,000\u2013100,000 for commercial equivalents.",
      answer_es: "Optimizaci\u00f3n de costos mediante right-sizing, apagado/encendido por tags, reducci\u00f3n de deuda t\u00e9cnica y gobernanza."
    },
    {
      id: "iac",
      triggers: ["infrastructure as code","terraform","cloudformation","sam","cdk"],
      answer_en: "Terraform, SAM, CloudFormation, and CDK in production deployments. Roberto acts as guardian \u2014 reviews and executes production deployments, coordinates CAB process, and maintains DRP templates.",
      answer_es: "Terraform, SAM, CloudFormation y CDK en despliegues de producci\u00f3n. Roberto act\u00faa como guardi\u00e1n \u2014 revisa y ejecuta despliegues, coordina el proceso CAB."
    },
    {
      id: "monitoring",
      triggers: ["monitoring","observability","cloudwatch","alerts","monitoreo"],
      answer_en: "PRTG for network, CloudWatch for AWS metrics, CloudTrail for audit, Systems Manager for fleet management. 25% improvement in incident response times through ITSM integration.",
      answer_es: "PRTG para red, CloudWatch para m\u00e9tricas AWS, CloudTrail para auditor\u00eda, Systems Manager para gesti\u00f3n de flota. 25% mejora en tiempos de respuesta."
    },

    {
      id: "security",
      triggers: ["security","devsecops","compliance","seguridad"],
      answer_en: "Defense in depth: AWS WAF for national health data, SCPs across 6 OUs, IAM least-privilege, automated security auditing across 90+ repositories, data masking, KMS, Secrets Manager. In Kaitiaki: 10 layers including STRIDE threat modeling.",
      answer_es: "Defensa en profundidad: AWS WAF, SCPs en 6 OUs, IAM least-privilege, auditor\u00edas automatizadas en 90+ repositorios, data masking, KMS, Secrets Manager."
    },
    {
      id: "drp",
      triggers: ["disaster recovery","drp","rto","business continuity"],
      answer_en: "DRP framework that reduced RTO from 24h to less than 4h (83% improvement). Protects 19M weekly transactions. Uses Terraform, SAM, and Boto3 templates for automated recovery. 99.95% uptime.",
      answer_es: "Framework DRP que redujo RTO de 24h a menos de 4h (83% mejora). Protege 19M transacciones semanales. 99.95% uptime."
    },
    {
      id: "automation",
      triggers: ["automation","rpa","bots","automatizacion"],
      answer_en: "18 Python RPA bots in production saving 55,000+ hours annually. Evolution: Google Forms, then Selenium, Camelot for PDF extraction, Power Automate Desktop, then complex legacy integrations. Also automated security auditing across 90+ repositories.",
      answer_es: "18 bots RPA en Python en producci\u00f3n ahorrando 55,000+ horas anuales. Evoluci\u00f3n: Google Forms, Selenium, Camelot, Power Automate Desktop, integraciones legacy."
    },
    {
      id: "python",
      triggers: ["python","programming","coding","boto3","programacion"],
      answer_en: "8+ years in production: AWS automation with Boto3, RPA development (18 bots), Lambda functions, ETL, system administration scripting. Not a pure developer \u2014 an infrastructure engineer who codes to automate and solve operational problems.",
      answer_es: "8+ a\u00f1os en producci\u00f3n: automatizaci\u00f3n AWS con Boto3, desarrollo RPA (18 bots), funciones Lambda, ETL. No es un desarrollador puro \u2014 es un ingeniero de infraestructura que programa para automatizar."
    },
    {
      id: "genai",
      triggers: ["ai","genai","bedrock","lex","machine learning","inteligencia artificial"],
      answer_en: "Orchestrated GenAI with Bedrock and Lex V2 for Ministry of Health \u2014 automating 70% of citizen inquiries. Built AI call center labs with Whisper, GPT-2. Aria uses Bedrock with RAG. Kaitiaki: Claude for code analysis with Guardrails against prompt injection.",
      answer_es: "Orquest\u00f3 soluciones GenAI con Bedrock y Lex V2 para el Ministerio de Salud \u2014 70% automatizaci\u00f3n. Laboratorios de call center con IA. Aria usa Bedrock con RAG."
    },

    {
      id: "databases",
      triggers: ["database","rds","dynamodb","postgresql","base de datos"],
      answer_en: "RDS (PostgreSQL) and DynamoDB in production. Knows when NOT to use each. Handles DB deployments, optimization, user creation, and rollbacks. Also Aurora and pgvector for vector search.",
      answer_es: "RDS (PostgreSQL) y DynamoDB en producci\u00f3n. Sabe cu\u00e1ndo NO usar cada una. Maneja despliegues, optimizaci\u00f3n y rollbacks. Tambi\u00e9n Aurora y pgvector."
    },
    {
      id: "docker",
      triggers: ["docker","containers","kubernetes","containerization","contenedores"],
      answer_en: "Docker at an operational level for database deployments. Primary strength is serverless architecture, but comfortable with containerized operations. Kubernetes: not yet needed, but his track record shows he learns technologies in production when required.",
      answer_es: "Docker a nivel operacional para despliegues de BD. Su fortaleza principal es serverless. Kubernetes: a\u00fan no ha sido necesario, pero aprende en producci\u00f3n cuando se requiere."
    },
    {
      id: "sanna_project",
      triggers: ["sanna","sanna law","children health"],
      answer_en: "Processing system for sick leave for parents of children with serious illness. Built in 1 month with no system, team, or budget. Google Sites + Forms + JavaScript for 28 branches. Meant for 3 months, ran 6 years.",
      answer_es: "Sistema de tramitaci\u00f3n de reposo por enfermedad grave de NNA. Construido en 1 mes sin sistema, equipo ni presupuesto. Para 28 sucursales. Para 3 meses, dur\u00f3 6 a\u00f1os."
    },
    {
      id: "pandemic_migration",
      triggers: ["pandemic","migration","2020","covid","pandemia","migracion"],
      answer_en: "Physical infrastructure couldn't handle ISAPRE system v2. Migrated to AWS with internal team \u2014 no external consultant. Learned in production with systems that could not fail. This is where Roberto's real AWS expertise was forged.",
      answer_es: "La infraestructura f\u00edsica no aguant\u00f3 el sistema ISAPRE v2. Migraron a AWS con equipo interno \u2014 sin consultor externo. Aprendi\u00f3 en producci\u00f3n con sistemas que no pod\u00edan fallar."
    },
    {
      id: "kaitiaki_architecture",
      triggers: ["kaitiaki architecture","hexagonal","ports and adapters","arquitectura"],
      answer_en: "Hexagonal architecture (Ports and Adapters), event-driven, microservices. Frontend through CloudFront to API Gateway with Cognito auth, then Lambda to DynamoDB and SQS. DevSecOps: separate Terraform stack with 14 Lambdas in VPC connected to Bedrock.",
      answer_es: "Arquitectura Hexagonal (Ports and Adapters), event-driven, microservicios. Frontend v\u00eda CloudFront a API Gateway con Cognito, luego Lambda a DynamoDB/SQS."
    },

    {
      id: "kaitiaki_testing",
      triggers: ["kaitiaki testing","unit tests","pytest","testing"],
      answer_en: "193+ unit tests using pytest, Hypothesis for property-based testing, moto for mocking AWS services. JMeter for load testing. The WAF module alone has 193 tests.",
      answer_es: "193+ tests unitarios con pytest, Hypothesis para testing property-based, moto para mocking AWS. JMeter para carga."
    },
    {
      id: "kaitiaki_languages",
      triggers: ["kaitiaki languages","i18n","te reo","maori"],
      answer_en: "English, Spanish, and Te Reo M\u0101ori \u2014 the indigenous language of Aotearoa New Zealand. 1,350 translation keys across all three languages.",
      answer_es: "Ingl\u00e9s, Espa\u00f1ol y Te Reo M\u0101ori. 1,350 keys de traducci\u00f3n en los tres idiomas."
    },
    {
      id: "compliance",
      triggers: ["compliance","iso","cis","pci","hipaa","nist"],
      answer_en: "ISO 9001 (certified Lead Implementer since 2007). In Kaitiaki: CIS AWS Foundations, PCI-DSS, HIPAA, ISO 27001, NIST CSF \u2014 all mapped and evidenced.",
      answer_es: "ISO 9001 (implementador certificado desde 2007). En Kaitiaki: CIS, PCI-DSS, HIPAA, ISO 27001, NIST CSF."
    },
    {
      id: "demo",
      triggers: ["demo","see it live","show me","can i see it","ver demo"],
      answer_en: "Yes! Roberto can do a live screen-share session to walk you through the platform. The source code is also available on GitHub. Would you like to schedule a demo?",
      answer_es: "S\u00ed! Roberto puede hacer una sesi\u00f3n en vivo para mostrar la plataforma. El c\u00f3digo est\u00e1 en GitHub. \u00bfQuiere agendar una demo?"
    },
    {
      id: "interview",
      triggers: ["interview","schedule","meet","agendar","entrevista","reunirse"],
      answer_en: "Of course! Roberto is available for video calls, flexible on time zones. Contact him at roberto.moreno.a@gmail.com or via LinkedIn. What day works best?",
      answer_es: "Por supuesto! Roberto est\u00e1 disponible para videollamadas, flexible con zonas horarias. Cont\u00e1ctalo en roberto.moreno.a@gmail.com o LinkedIn."
    },
    {
      id: "contact",
      triggers: ["contact","email","phone","linkedin","contacto","correo"],
      answer_en: "Email: roberto.moreno.a@gmail.com \u2022 LinkedIn: linkedin.com/in/roberto-moreno-araneda-6ab74a73 \u2022 GitHub: github.com/rmorenoar",
      answer_es: "Email: roberto.moreno.a@gmail.com \u2022 LinkedIn: linkedin.com/in/roberto-moreno-araneda-6ab74a73 \u2022 GitHub: github.com/rmorenoar"
    },

    {
      id: "weakness",
      triggers: ["weakness","biggest weakness","debilidad"],
      answer_en: "Monotony. Roberto thrives on solving new problems and building new things. Repetitive work without challenge drains him \u2014 which is why he automates everything he can.",
      answer_es: "La monoton\u00eda. Roberto se motiva resolviendo problemas nuevos. El trabajo repetitivo lo agota \u2014 por eso automatiza todo lo que puede."
    },
    {
      id: "five_years",
      triggers: ["five years","5 years","future","donde te ves","futuro"],
      answer_en: "Living a balanced life in a natural environment with outdoor activity. Certified in AWS and Azure. With personal applications running. On the beaches of Whangarei.",
      answer_es: "Teniendo una vida balanceada en un entorno natural, con actividad outdoor. Certificado en AWS y Azure. En las playas de Whangarei."
    },
    {
      id: "why_leaving",
      triggers: ["why leaving","leave current","por que dejas","por que se va"],
      answer_en: "After 9 years, Roberto wants to change his lifestyle. He wants his family to grow in an environment with outdoor culture, nature, and safety. Also interested in exploring more generative AI development.",
      answer_es: "Despu\u00e9s de 9 a\u00f1os quiere cambiar el estilo de vida. Que su familia crezca en un entorno con naturaleza y seguridad. Tambi\u00e9n quiere experimentar m\u00e1s con IA generativa."
    },
    {
      id: "english_level",
      triggers: ["english","language level","ingles","how is your english","idioma"],
      answer_en: "Improving every day. What challenges him most is when people speak very fast or everyone talks at once. He communicates well in professional settings and continues to improve.",
      answer_es: "Mejora cada d\u00eda. Lo que m\u00e1s le cuesta es cuando hablan muy r\u00e1pido y todos a la vez. Se comunica bien en entornos profesionales."
    },
    {
      id: "no_aws_cert",
      triggers: ["no certification","why no cert","aws certification","certificacion aws"],
      answer_en: "The main reason is time \u2014 the current work pace leaves little room. He's at 65% completion on AWS Skill Builder and expects to certify by June 2026. But he has 6 years of real production experience managing 1,800+ Lambda functions.",
      answer_es: "La raz\u00f3n principal es tiempo. Est\u00e1 al 65% en AWS Skill Builder y espera certificarse en junio 2026. Pero tiene 6 a\u00f1os de experiencia real en producci\u00f3n."
    },
    {
      id: "serverless",
      triggers: ["serverless","event driven","event-driven"],
      answer_en: "1,824 Lambda functions, DynamoDB, API Gateway, SQS, EventBridge, SNS in production. Kaitiaki is also 100% serverless with 16 Lambdas.",
      answer_es: "1,824 funciones Lambda, DynamoDB, API Gateway, SQS, EventBridge, SNS en producci\u00f3n. Kaitiaki tambi\u00e9n 100% serverless."
    },

    {
      id: "cities",
      triggers: ["cities","where in nz","location","whangarei","nelson","wellington","auckland"],
      answer_en: "All of New Zealand. Preferences: Whangarei, Nelson, Wellington, Auckland, Christchurch.",
      answer_es: "Todo Nueva Zelanda. Preferencias: Whangarei, Nelson, Wellington, Auckland, Christchurch."
    },
    {
      id: "nzqa",
      triggers: ["nzqa","qualification","degree","level 7","titulo"],
      answer_en: "NZQA Level 7 Bachelor's degree. Ingeniero de Ejecuci\u00f3n Industrial, Universidad de Santiago de Chile. Issued May 2026, Application 189816.",
      answer_es: "NZQA Level 7. Ingeniero de Ejecuci\u00f3n Industrial, Universidad de Santiago de Chile. Emitido mayo 2026, Aplicaci\u00f3n 189816."
    },
    {
      id: "long_term",
      triggers: ["long term","commitment","permanent","largo plazo"],
      answer_en: "Yes. Family decision. They want to raise their family in New Zealand. Long-term commitment, not a short-term opportunity.",
      answer_es: "S\u00ed. Decisi\u00f3n familiar. Quieren criar a su familia en Nueva Zelanda. Compromiso a largo plazo."
    },
    {
      id: "itil",
      triggers: ["itil","itsm","cmdb","cab","incident management"],
      answer_en: "Implemented CMDB, CAB processes for production governance, user management, change management, incident management. Uses Jira and GLPI as ITSM tools.",
      answer_es: "Implement\u00f3 CMDB, procesos CAB para gobernanza de producci\u00f3n, gesti\u00f3n de usuarios, gesti\u00f3n del cambio, gesti\u00f3n de incidentes. Usa Jira y GLPI."
    },
    {
      id: "waf",
      triggers: ["waf","web application firewall","firewall"],
      answer_en: "Strategic WAF configuration for sensitive national health data. Controlled deployment with listening period, staged rollout, and automated rollback. Also OWASP Top 10 rules in Kaitiaki.",
      answer_es: "Configuraci\u00f3n estrat\u00e9gica WAF para datos de salud nacional. Despliegue controlado con periodo de escucha y rollback automatizado."
    },
    {
      id: "about_company",
      triggers: ["about our company","what do you know about us","que sabes de nosotros"],
      answer_en: "Roberto always researches the organization before applying. His approach is that every company is unique, with its own potential and capable people. He's worked across diverse sectors \u2014 from chemical industry to public services.",
      answer_es: "Roberto siempre investiga la organizaci\u00f3n antes de postular. Su enfoque es que cada empresa es \u00fanica, con potencial propio y personas capaces."
    },
    {
      id: "questions_for_us",
      triggers: ["questions for us","any questions","preguntas para nosotros"],
      answer_en: "Roberto typically asks: What is the biggest technical challenge you face today and what would you like to solve in the next 6 months?",
      answer_es: "Roberto suele preguntar: \u00bfCu\u00e1l es el mayor desaf\u00edo t\u00e9cnico que enfrentan hoy y qu\u00e9 les gustar\u00eda resolver en los pr\u00f3ximos 6 meses?"
    }
  ]
};


// ============================================================
// MATCHING ENGINE
// ============================================================
function detectLanguage(text) {
  const esIndicators = /\b(hola|que|como|donde|cuando|puede|tiene|sobre|experiencia|trabajo|cuanto|por que|cual)\b/i;
  return esIndicators.test(text) ? 'es' : 'en';
}

function normalizeText(text) {
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findBestMatch(userInput) {
  const normalized = normalizeText(userInput);
  const words = normalized.split(' ');
  let bestMatch = null;
  let bestScore = 0;

  for (const q of ARIA_KB.questions) {
    let score = 0;
    for (const trigger of q.triggers) {
      const normTrigger = normalizeText(trigger);
      // Exact trigger match
      if (normalized.includes(normTrigger)) {
        score = Math.max(score, normTrigger.split(' ').length * 10);
      }
      // Word-level matching
      const triggerWords = normTrigger.split(' ');
      let wordMatches = 0;
      for (const tw of triggerWords) {
        if (words.some(w => w === tw || w.includes(tw) || tw.includes(w))) {
          wordMatches++;
        }
      }
      const wordScore = (wordMatches / triggerWords.length) * 5;
      score = Math.max(score, wordScore);
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = q;
    }
  }

  return bestScore >= 3 ? bestMatch : null;
}

function getResponse(userInput) {
  const lang = detectLanguage(userInput);
  const match = findBestMatch(userInput);
  
  if (match) {
    return lang === 'es' ? match.answer_es : match.answer_en;
  }
  
  if (lang === 'es') {
    return "No tengo informaci\u00f3n espec\u00edfica sobre eso, pero puedes preguntarme sobre: experiencia AWS, proyectos (Kaitiaki), disponibilidad, visa, salario, o contactar directamente a Roberto en roberto.moreno.a@gmail.com";
  }
  return "I don't have specific information about that, but you can ask me about: AWS experience, projects (Kaitiaki), availability, visa status, salary expectations, or contact Roberto directly at roberto.moreno.a@gmail.com";
}


// ============================================================
// CHAT UI
// ============================================================
function createChatWidget() {
  // Inject CSS
  const style = document.createElement('style');
  style.textContent = `
    #aria-chat-toggle {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff9900 0%, #ff6b00 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(255, 153, 0, 0.4), 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: aria-pulse 3s infinite;
    }
    #aria-chat-toggle:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 40px rgba(255, 153, 0, 0.6), 0 6px 16px rgba(0,0,0,0.4);
    }
    #aria-chat-toggle svg {
      width: 32px;
      height: 32px;
      fill: white;
    }
    @keyframes aria-pulse {
      0%, 100% { box-shadow: 0 8px 32px rgba(255, 153, 0, 0.4), 0 4px 12px rgba(0,0,0,0.3); }
      50% { box-shadow: 0 8px 40px rgba(255, 153, 0, 0.6), 0 4px 16px rgba(0,0,0,0.4); }
    }
    #aria-chat-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #22c55e;
      color: white;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 10px;
      border: 2px solid #0f172a;
      animation: aria-badge-bounce 2s ease-in-out infinite;
    }
    @keyframes aria-badge-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    #aria-chat-panel {
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 380px;
      max-width: calc(100vw - 48px);
      height: 520px;
      max-height: calc(100vh - 140px);
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,153,0,0.1);
      z-index: 9998;
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: aria-slide-up 0.3s ease-out;
    }
    #aria-chat-panel.open { display: flex; }
    @keyframes aria-slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .aria-header {
      background: linear-gradient(135deg, #232f3e 0%, #1a2332 100%);
      padding: 16px 20px;
      border-bottom: 2px solid #ff9900;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .aria-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff9900, #ff6b00);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 900;
      color: white;
      flex-shrink: 0;
    }
    .aria-header-info h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 800;
      color: white;
      font-family: 'Inter', sans-serif;
    }
    .aria-header-info p {
      margin: 2px 0 0;
      font-size: 11px;
      color: #94a3b8;
      font-family: 'Inter', sans-serif;
    }
    .aria-close-btn {
      margin-left: auto;
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      font-size: 20px;
      padding: 4px;
      border-radius: 4px;
      transition: color 0.2s;
    }
    .aria-close-btn:hover { color: #ff9900; }

    .aria-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .aria-messages::-webkit-scrollbar { width: 4px; }
    .aria-messages::-webkit-scrollbar-track { background: transparent; }
    .aria-messages::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
    .aria-msg {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13px;
      line-height: 1.5;
      font-family: 'Inter', sans-serif;
      word-wrap: break-word;
    }
    .aria-msg.bot {
      align-self: flex-start;
      background: #0f172a;
      color: #e2e8f0;
      border: 1px solid #334155;
      border-bottom-left-radius: 4px;
    }
    .aria-msg.user {
      align-self: flex-end;
      background: linear-gradient(135deg, #ff9900, #ff6b00);
      color: white;
      border-bottom-right-radius: 4px;
    }
    .aria-starters {
      padding: 0 16px 12px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .aria-starter-btn {
      background: #0f172a;
      border: 1px solid #334155;
      color: #94a3b8;
      padding: 5px 10px;
      border-radius: 16px;
      font-size: 11px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: all 0.2s;
      white-space: nowrap;
    }
    .aria-starter-btn:hover {
      border-color: #ff9900;
      color: #ff9900;
      background: rgba(255, 153, 0, 0.05);
    }

    .aria-input-area {
      padding: 12px 16px;
      border-top: 1px solid #334155;
      display: flex;
      gap: 8px;
      background: #232f3e;
    }
    .aria-input {
      flex: 1;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 20px;
      padding: 10px 16px;
      color: #e2e8f0;
      font-size: 13px;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color 0.2s;
    }
    .aria-input:focus { border-color: #ff9900; }
    .aria-input::placeholder { color: #475569; }
    .aria-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ff9900, #ff6b00);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .aria-send-btn:hover { transform: scale(1.1); }
    .aria-send-btn svg { width: 18px; height: 18px; fill: white; }
    .aria-typing {
      align-self: flex-start;
      padding: 10px 14px;
      background: #0f172a;
      border: 1px solid #334155;
      border-radius: 12px;
      border-bottom-left-radius: 4px;
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .aria-typing span {
      width: 6px;
      height: 6px;
      background: #ff9900;
      border-radius: 50%;
      animation: aria-typing-dot 1.4s infinite;
    }
    .aria-typing span:nth-child(2) { animation-delay: 0.2s; }
    .aria-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes aria-typing-dot {
      0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
      30% { opacity: 1; transform: scale(1); }
    }
    .aria-powered {
      text-align: center;
      font-size: 9px;
      color: #475569;
      padding: 4px;
      font-family: 'JetBrains Mono', monospace;
    }
    @media print { #aria-chat-toggle, #aria-chat-panel { display: none !important; } }
  `;
  document.head.appendChild(style);


  // Create toggle button
  const toggle = document.createElement('button');
  toggle.id = 'aria-chat-toggle';
  toggle.setAttribute('aria-label', 'Chat with Aria - AI Assistant');
  toggle.innerHTML = `
    <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
    <span id="aria-chat-badge">AI</span>
  `;
  document.body.appendChild(toggle);

  // Create chat panel
  const panel = document.createElement('div');
  panel.id = 'aria-chat-panel';
  panel.innerHTML = `
    <div class="aria-header">
      <div class="aria-avatar">A</div>
      <div class="aria-header-info">
        <h3>Aria</h3>
        <p>Roberto's AI Portfolio Assistant</p>
      </div>
      <button class="aria-close-btn" aria-label="Close chat">&times;</button>
    </div>
    <div class="aria-messages" id="aria-messages"></div>
    <div class="aria-starters" id="aria-starters"></div>
    <div class="aria-input-area">
      <input type="text" class="aria-input" id="aria-input" placeholder="Ask me anything about Roberto..." autocomplete="off">
      <button class="aria-send-btn" id="aria-send" aria-label="Send message">
        <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    </div>
    <div class="aria-powered">powered by Aria \u2022 Kaitiaki Mataara Kapua</div>
  `;
  document.body.appendChild(panel);


  // DOM references
  const messagesEl = document.getElementById('aria-messages');
  const startersEl = document.getElementById('aria-starters');
  const inputEl = document.getElementById('aria-input');
  const sendBtn = document.getElementById('aria-send');
  const closeBtn = panel.querySelector('.aria-close-btn');

  // Populate conversation starters
  ARIA_KB.conversation_starters.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'aria-starter-btn';
    btn.textContent = text;
    btn.addEventListener('click', () => sendMessage(text));
    startersEl.appendChild(btn);
  });

  // Add welcome message
  addBotMessage(ARIA_KB.intro);

  // Event listeners
  toggle.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      inputEl.focus();
      const badge = document.getElementById('aria-chat-badge');
      if (badge) badge.style.display = 'none';
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
  });

  sendBtn.addEventListener('click', () => {
    const text = inputEl.value.trim();
    if (text) sendMessage(text);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = inputEl.value.trim();
      if (text) sendMessage(text);
    }
  });


  // ============================================================
  // API CONFIGURATION
  // ============================================================
  // Set this to your API Gateway URL after deployment.
  // If empty or null, the widget uses local matching (no audio API fallback).
  const ARIA_API_URL = window.ARIA_API_URL || null;

  // S3 bucket URL for pre-generated Polly Aria audio (public)
  const ARIA_AUDIO_BASE_URL = "https://aria-audio-nz.s3.ap-southeast-2.amazonaws.com";


  // Chat functions
  function sendMessage(text) {
    addUserMessage(text);
    inputEl.value = '';
    startersEl.style.display = 'none';

    // Show typing indicator
    const typing = document.createElement('div');
    typing.className = 'aria-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Try local matching first (instant)
    const lang = detectLanguage(text);
    const match = findBestMatch(text);

    if (match) {
      // Local match found — instant text + fetch audio from S3
      typing.remove();
      const response = lang === 'es' ? match.answer_es : match.answer_en;
      addBotMessage(response);
      // Load and play pre-generated Aria NZ audio from S3
      playFromS3(match.id);
    } else if (ARIA_API_URL) {
      // No local match — call Bedrock API
      fetchApiResponse(text).then(result => {
        typing.remove();
        addBotMessage(result.text);
        if (result.audio) {
          playBase64Audio(result.audio);
        } else {
          // Fallback: browser synthetic voice
          speakWithBrowser(result.text);
        }
      }).catch(() => {
        typing.remove();
        const response = getResponse(text);
        addBotMessage(response);
        speakWithBrowser(response);
      });
    } else {
      // No API configured — local match fallback with browser voice
      const delay = 300 + Math.random() * 500;
      setTimeout(() => {
        typing.remove();
        const response = getResponse(text);
        addBotMessage(response);
        speakWithBrowser(response);
      }, delay);
    }
  }

  async function fetchApiResponse(text) {
    const response = await fetch(ARIA_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text }),
    });
    if (!response.ok) throw new Error('API error');
    return await response.json();
  }

  function playFromS3(questionId) {
    try {
      const url = `${ARIA_AUDIO_BASE_URL}/${questionId}.mp3`;
      const audio = new Audio(url);
      audio.play().catch(() => {});
    } catch (e) {
      // Silent fail
    }
  }

  function playBase64Audio(base64Audio) {
    try {
      const audioData = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(audioData.length);
      const view = new Uint8Array(arrayBuffer);
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play().catch(() => {});
      audio.onended = () => URL.revokeObjectURL(url);
    } catch (e) {
      // Silent fail
    }
  }

  function speakWithBrowser(text) {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-NZ';
        utterance.rate = 0.95;
        speechSynthesis.speak(utterance);
      }
    } catch (e) {
      // Silent fail
    }
  }

  function addUserMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'aria-msg user';
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addBotMessage(text) {
    const msg = document.createElement('div');
    msg.className = 'aria-msg bot';
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

// ============================================================
// INITIALIZE
// ============================================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createChatWidget);
} else {
  createChatWidget();
}

})();
