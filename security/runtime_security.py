"""
Runtime Security Scanning
GitHub Advanced Security + Dependabot + Semgrep integration
"""

from typing import Dict, List, Any, Optional, Tuple
import asyncio
import json
import logging
import subprocess
import tempfile
import os
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import httpx
import yaml

logger = logging.getLogger(__name__)


class SecuritySeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class SecurityTool(str, Enum):
    DEPENDABOT = "dependabot"
    CODEQL = "codeql"
    SEMGREP = "semgrep"
    GITLEAKS = "gitleaks"
    TRIVY = "trivy"
    SONARQUBE = "sonarqube"


class SecurityIssueType(str, Enum):
    VULNERABILITY = "vulnerability"
    SECRET_LEAK = "secret_leak"
    CODE_QUALITY = "code_quality"
    DEPENDENCY = "dependency"
    CONFIGURATION = "configuration"
    RUNTIME = "runtime"


@dataclass
class SecurityIssue:
    """Security issue data"""
    id: str
    tool: SecurityTool
    issue_type: SecurityIssueType
    severity: SecuritySeverity
    title: str
    description: str
    file_path: str
    line_number: Optional[int]
    column_number: Optional[int]
    code_snippet: Optional[str]
    cwe_id: Optional[str]
    cve_id: Optional[str]
    cvss_score: Optional[float]
    remediation: Optional[str]
    detected_at: datetime
    status: str = "open"
    assigned_to: Optional[str] = None
    resolved_at: Optional[datetime] = None


@dataclass
class SecurityScanResult:
    """Security scan result"""
    scan_id: str
    tool: SecurityTool
    scan_type: str
    started_at: datetime
    completed_at: datetime
    total_issues: int
    issues_by_severity: Dict[str, int]
    issues: List[SecurityIssue]
    scan_config: Dict[str, Any]
    success: bool
    error_message: Optional[str] = None


class RuntimeSecurityScanner:
    """Runtime security scanning service"""
    
    def __init__(self, github_token: str, semgrep_token: str):
        self.github_token = github_token
        self.semgrep_token = semgrep_token
        self.scan_results = {}
        self.scan_schedules = {}
        
        # Security configurations
        self.security_configs = {
            SecurityTool.DEPENDABOT: {
                "enabled": True,
                "schedule": "daily",
                "update_types": ["security", "version"],
                "target_branch": "main"
            },
            SecurityTool.CODEQL: {
                "enabled": True,
                "schedule": "weekly",
                "languages": ["python", "javascript", "typescript"],
                "queries": "security-and-quality"
            },
            SecurityTool.SEMGREP: {
                "enabled": True,
                "schedule": "daily",
                "rulesets": ["p/security", "p/python", "p/javascript"],
                "severity_threshold": "medium"
            },
            SecurityTool.GITLEAKS: {
                "enabled": True,
                "schedule": "on_push",
                "severity_threshold": "high"
            },
            SecurityTool.TRIVY: {
                "enabled": True,
                "schedule": "daily",
                "scan_types": ["vuln", "secret", "config"],
                "severity_threshold": "medium"
            }
        }
    
    async def run_comprehensive_scan(self, repository_path: str, scan_types: List[SecurityTool] = None) -> Dict[str, SecurityScanResult]:
        """Run comprehensive security scan"""
        
        if scan_types is None:
            scan_types = list(SecurityTool)
        
        scan_results = {}
        
        for tool in scan_types:
            if not self.security_configs.get(tool, {}).get("enabled", False):
                continue
            
            try:
                logger.info(f"Starting {tool.value} scan...")
                result = await self._run_tool_scan(tool, repository_path)
                scan_results[tool.value] = result
                self.scan_results[f"{tool.value}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"] = result
                
            except Exception as e:
                logger.error(f"Failed to run {tool.value} scan: {str(e)}")
                scan_results[tool.value] = SecurityScanResult(
                    scan_id=f"{tool.value}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                    tool=tool,
                    scan_type="comprehensive",
                    started_at=datetime.utcnow(),
                    completed_at=datetime.utcnow(),
                    total_issues=0,
                    issues_by_severity={},
                    issues=[],
                    scan_config=self.security_configs.get(tool, {}),
                    success=False,
                    error_message=str(e)
                )
        
        return scan_results
    
    async def _run_tool_scan(self, tool: SecurityTool, repository_path: str) -> SecurityScanResult:
        """Run specific security tool scan"""
        
        scan_id = f"{tool.value}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        started_at = datetime.utcnow()
        
        try:
            if tool == SecurityTool.DEPENDABOT:
                return await self._run_dependabot_scan(scan_id, started_at, repository_path)
            elif tool == SecurityTool.CODEQL:
                return await self._run_codeql_scan(scan_id, started_at, repository_path)
            elif tool == SecurityTool.SEMGREP:
                return await self._run_semgrep_scan(scan_id, started_at, repository_path)
            elif tool == SecurityTool.GITLEAKS:
                return await self._run_gitleaks_scan(scan_id, started_at, repository_path)
            elif tool == SecurityTool.TRIVY:
                return await self._run_trivy_scan(scan_id, started_at, repository_path)
            else:
                raise ValueError(f"Unsupported security tool: {tool}")
                
        except Exception as e:
            logger.error(f"Tool scan failed for {tool.value}: {str(e)}")
            return SecurityScanResult(
                scan_id=scan_id,
                tool=tool,
                scan_type="comprehensive",
                started_at=started_at,
                completed_at=datetime.utcnow(),
                total_issues=0,
                issues_by_severity={},
                issues=[],
                scan_config=self.security_configs.get(tool, {}),
                success=False,
                error_message=str(e)
            )
    
    async def _run_dependabot_scan(self, scan_id: str, started_at: datetime, repository_path: str) -> SecurityScanResult:
        """Run Dependabot security scan"""
        
        try:
            # Check for dependency vulnerabilities using GitHub API
            vulnerabilities = await self._check_github_dependabot_alerts(repository_path)
            
            issues = []
            for vuln in vulnerabilities:
                issue = SecurityIssue(
                    id=f"dependabot_{vuln['number']}",
                    tool=SecurityTool.DEPENDABOT,
                    issue_type=SecurityIssueType.VULNERABILITY,
                    severity=SecuritySeverity(vuln['security_advisory']['severity'].lower()),
                    title=vuln['security_advisory']['summary'],
                    description=vuln['security_advisory']['description'],
                    file_path=vuln['dependency']['manifest_path'],
                    line_number=None,
                    column_number=None,
                    code_snippet=None,
                    cwe_id=vuln['security_advisory'].get('cwe_ids', [None])[0],
                    cve_id=vuln['security_advisory'].get('cve_id'),
                    cvss_score=vuln['security_advisory'].get('cvss', {}).get('score'),
                    remediation=vuln['security_advisory'].get('references', [{}])[0].get('url'),
                    detected_at=datetime.fromisoformat(vuln['created_at'].replace('Z', '+00:00'))
                )
                issues.append(issue)
            
            # Calculate severity distribution
            issues_by_severity = self._calculate_severity_distribution(issues)
            
            return SecurityScanResult(
                scan_id=scan_id,
                tool=SecurityTool.DEPENDABOT,
                scan_type="dependency_vulnerability",
                started_at=started_at,
                completed_at=datetime.utcnow(),
                total_issues=len(issues),
                issues_by_severity=issues_by_severity,
                issues=issues,
                scan_config=self.security_configs[SecurityTool.DEPENDABOT],
                success=True
            )
            
        except Exception as e:
            logger.error(f"Dependabot scan failed: {str(e)}")
            raise
    
    async def _run_codeql_scan(self, scan_id: str, started_at: datetime, repository_path: str) -> SecurityScanResult:
        """Run CodeQL security scan"""
        
        try:
            # In production, this would run actual CodeQL scan
            # For now, simulate the scan
            
            issues = []
            
            # Simulate CodeQL findings
            mock_issues = [
                {
                    "rule": "py/clear-text-logging",
                    "severity": "error",
                    "message": "Logging credentials in plain text",
                    "file": "app/auth.py",
                    "line": 45,
                    "column": 10
                },
                {
                    "rule": "py/sql-injection",
                    "severity": "error",
                    "message": "SQL injection vulnerability",
                    "file": "app/database.py",
                    "line": 123,
                    "column": 5
                }
            ]
            
            for mock_issue in mock_issues:
                issue = SecurityIssue(
                    id=f"codeql_{hash(mock_issue['rule'] + mock_issue['file'] + str(mock_issue['line']))}",
                    tool=SecurityTool.CODEQL,
                    issue_type=SecurityIssueType.CODE_QUALITY,
                    severity=SecuritySeverity(mock_issue['severity']),
                    title=mock_issue['rule'],
                    description=mock_issue['message'],
                    file_path=mock_issue['file'],
                    line_number=mock_issue['line'],
                    column_number=mock_issue['column'],
                    code_snippet=None,
                    cwe_id=None,
                    cve_id=None,
                    cvss_score=None,
                    remediation="Follow secure coding practices",
                    detected_at=datetime.utcnow()
                )
                issues.append(issue)
            
            issues_by_severity = self._calculate_severity_distribution(issues)
            
            return SecurityScanResult(
                scan_id=scan_id,
                tool=SecurityTool.CODEQL,
                scan_type="static_analysis",
                started_at=started_at,
                completed_at=datetime.utcnow(),
                total_issues=len(issues),
                issues_by_severity=issues_by_severity,
                issues=issues,
                scan_config=self.security_configs[SecurityTool.CODEQL],
                success=True
            )
            
        except Exception as e:
            logger.error(f"CodeQL scan failed: {str(e)}")
            raise
    
    async def _run_semgrep_scan(self, scan_id: str, started_at: datetime, repository_path: str) -> SecurityScanResult:
        """Run Semgrep security scan"""
        
        try:
            # Run Semgrep scan
            cmd = [
                "semgrep",
                "--config=auto",
                "--json",
                "--severity=ERROR",
                "--severity=WARNING",
                repository_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode != 0:
                raise Exception(f"Semgrep scan failed: {result.stderr}")
            
            semgrep_results = json.loads(result.stdout)
            issues = []
            
            for finding in semgrep_results.get('results', []):
                severity = finding.get('extra', {}).get('severity', 'info').lower()
                if severity not in ['error', 'warning', 'info']:
                    severity = 'info'
                
                issue = SecurityIssue(
                    id=f"semgrep_{finding['check_id']}_{hash(finding['path'] + str(finding['start']['line']))}",
                    tool=SecurityTool.SEMGREP,
                    issue_type=SecurityIssueType.CODE_QUALITY,
                    severity=SecuritySeverity(severity),
                    title=finding['check_id'],
                    description=finding.get('extra', {}).get('message', ''),
                    file_path=finding['path'],
                    line_number=finding['start']['line'],
                    column_number=finding['start']['col'],
                    code_snippet=finding.get('extra', {}).get('lines', ''),
                    cwe_id=finding.get('extra', {}).get('metadata', {}).get('cwe'),
                    cve_id=finding.get('extra', {}).get('metadata', {}).get('cve'),
                    cvss_score=finding.get('extra', {}).get('metadata', {}).get('cvss-score'),
                    remediation=finding.get('extra', {}).get('metadata', {}).get('fix'),
                    detected_at=datetime.utcnow()
                )
                issues.append(issue)
            
            issues_by_severity = self._calculate_severity_distribution(issues)
            
            return SecurityScanResult(
                scan_id=scan_id,
                tool=SecurityTool.SEMGREP,
                scan_type="static_analysis",
                started_at=started_at,
                completed_at=datetime.utcnow(),
                total_issues=len(issues),
                issues_by_severity=issues_by_severity,
                issues=issues,
                scan_config=self.security_configs[SecurityTool.SEMGREP],
                success=True
            )
            
        except Exception as e:
            logger.error(f"Semgrep scan failed: {str(e)}")
            raise
    
    async def _run_gitleaks_scan(self, scan_id: str, started_at: datetime, repository_path: str) -> SecurityScanResult:
        """Run Gitleaks secret detection scan"""
        
        try:
            # Run Gitleaks scan
            cmd = [
                "gitleaks",
                "detect",
                "--source", repository_path,
                "--report-format", "json",
                "--verbose"
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            # Gitleaks returns non-zero exit code when secrets are found
            if result.returncode not in [0, 1]:
                raise Exception(f"Gitleaks scan failed: {result.stderr}")
            
            issues = []
            
            if result.stdout.strip():
                gitleaks_results = json.loads(result.stdout)
                
                for finding in gitleaks_results:
                    issue = SecurityIssue(
                        id=f"gitleaks_{hash(finding['file'] + str(finding['line']))}",
                        tool=SecurityTool.GITLEAKS,
                        issue_type=SecurityIssueType.SECRET_LEAK,
                        severity=SecuritySeverity.HIGH,
                        title=f"Secret detected: {finding['rule']}",
                        description=f"Potential secret leak detected in {finding['file']}",
                        file_path=finding['file'],
                        line_number=finding['line'],
                        column_number=None,
                        code_snippet=finding.get('secret', ''),
                        cwe_id="CWE-798",
                        cve_id=None,
                        cvss_score=None,
                        remediation="Remove or rotate the exposed secret",
                        detected_at=datetime.utcnow()
                    )
                    issues.append(issue)
            
            issues_by_severity = self._calculate_severity_distribution(issues)
            
            return SecurityScanResult(
                scan_id=scan_id,
                tool=SecurityTool.GITLEAKS,
                scan_type="secret_detection",
                started_at=started_at,
                completed_at=datetime.utcnow(),
                total_issues=len(issues),
                issues_by_severity=issues_by_severity,
                issues=issues,
                scan_config=self.security_configs[SecurityTool.GITLEAKS],
                success=True
            )
            
        except Exception as e:
            logger.error(f"Gitleaks scan failed: {str(e)}")
            raise
    
    async def _run_trivy_scan(self, scan_id: str, started_at: datetime, repository_path: str) -> SecurityScanResult:
        """Run Trivy security scan"""
        
        try:
            # Run Trivy filesystem scan
            cmd = [
                "trivy",
                "fs",
                "--format", "json",
                "--severity", "HIGH,CRITICAL",
                repository_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode not in [0, 1]:
                raise Exception(f"Trivy scan failed: {result.stderr}")
            
            issues = []
            
            if result.stdout.strip():
                trivy_results = json.loads(result.stdout)
                
                for result_item in trivy_results.get('Results', []):
                    for vuln in result_item.get('Vulnerabilities', []):
                        issue = SecurityIssue(
                            id=f"trivy_{vuln['VulnerabilityID']}_{hash(result_item['Target'])}",
                            tool=SecurityTool.TRIVY,
                            issue_type=SecurityIssueType.VULNERABILITY,
                            severity=SecuritySeverity(vuln['Severity'].lower()),
                            title=vuln['Title'],
                            description=vuln.get('Description', ''),
                            file_path=result_item['Target'],
                            line_number=None,
                            column_number=None,
                            code_snippet=None,
                            cwe_id=vuln.get('CweIDs', [None])[0],
                            cve_id=vuln.get('VulnerabilityID'),
                            cvss_score=vuln.get('CVSS', {}).get('nvd', {}).get('V3Score'),
                            remediation=vuln.get('FixedVersion', 'Update to latest version'),
                            detected_at=datetime.utcnow()
                        )
                        issues.append(issue)
            
            issues_by_severity = self._calculate_severity_distribution(issues)
            
            return SecurityScanResult(
                scan_id=scan_id,
                tool=SecurityTool.TRIVY,
                scan_type="vulnerability_scan",
                started_at=started_at,
                completed_at=datetime.utcnow(),
                total_issues=len(issues),
                issues_by_severity=issues_by_severity,
                issues=issues,
                scan_config=self.security_configs[SecurityTool.TRIVY],
                success=True
            )
            
        except Exception as e:
            logger.error(f"Trivy scan failed: {str(e)}")
            raise
    
    async def _check_github_dependabot_alerts(self, repository_path: str) -> List[Dict[str, Any]]:
        """Check GitHub Dependabot alerts via API"""
        
        try:
            # Extract repository info from path
            repo_info = self._extract_repo_info(repository_path)
            if not repo_info:
                return []
            
            headers = {
                "Authorization": f"token {self.github_token}",
                "Accept": "application/vnd.github.v3+json"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.github.com/repos/{repo_info['owner']}/{repo_info['repo']}/dependabot/alerts",
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.warning(f"Failed to fetch Dependabot alerts: {response.status_code}")
                    return []
                    
        except Exception as e:
            logger.error(f"Failed to check GitHub Dependabot alerts: {str(e)}")
            return []
    
    def _extract_repo_info(self, repository_path: str) -> Optional[Dict[str, str]]:
        """Extract repository owner and name from path"""
        
        try:
            # This is a simplified extraction
            # In production, you'd parse git remote URLs
            path_parts = repository_path.split('/')
            if len(path_parts) >= 2:
                return {
                    "owner": path_parts[-2],
                    "repo": path_parts[-1]
                }
            return None
            
        except Exception as e:
            logger.error(f"Failed to extract repo info: {str(e)}")
            return None
    
    def _calculate_severity_distribution(self, issues: List[SecurityIssue]) -> Dict[str, int]:
        """Calculate distribution of issues by severity"""
        
        distribution = {}
        for severity in SecuritySeverity:
            distribution[severity.value] = sum(1 for issue in issues if issue.severity == severity)
        
        return distribution
    
    async def generate_security_report(self, scan_results: Dict[str, SecurityScanResult]) -> Dict[str, Any]:
        """Generate comprehensive security report"""
        
        try:
            total_issues = sum(result.total_issues for result in scan_results.values())
            
            # Aggregate severity distribution
            aggregated_severity = {}
            for severity in SecuritySeverity:
                aggregated_severity[severity.value] = sum(
                    result.issues_by_severity.get(severity.value, 0)
                    for result in scan_results.values()
                )
            
            # Get top issues by severity
            all_issues = []
            for result in scan_results.values():
                all_issues.extend(result.issues)
            
            # Sort by severity and CVSS score
            severity_order = {SecuritySeverity.CRITICAL: 0, SecuritySeverity.HIGH: 1, 
                            SecuritySeverity.MEDIUM: 2, SecuritySeverity.LOW: 3, SecuritySeverity.INFO: 4}
            
            all_issues.sort(key=lambda x: (severity_order[x.severity], x.cvss_score or 0), reverse=True)
            
            # Calculate security score
            security_score = self._calculate_security_score(aggregated_severity, total_issues)
            
            report = {
                "report_id": f"security_report_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
                "generated_at": datetime.utcnow().isoformat(),
                "summary": {
                    "total_issues": total_issues,
                    "security_score": security_score,
                    "severity_distribution": aggregated_severity,
                    "tools_used": list(scan_results.keys()),
                    "scans_successful": sum(1 for result in scan_results.values() if result.success),
                    "scans_failed": sum(1 for result in scan_results.values() if not result.success)
                },
                "top_issues": all_issues[:20],  # Top 20 issues
                "detailed_results": {
                    tool: {
                        "total_issues": result.total_issues,
                        "success": result.success,
                        "scan_duration": (result.completed_at - result.started_at).total_seconds(),
                        "severity_distribution": result.issues_by_severity
                    }
                    for tool, result in scan_results.items()
                },
                "recommendations": self._generate_security_recommendations(aggregated_severity, all_issues)
            }
            
            return report
            
        except Exception as e:
            logger.error(f"Failed to generate security report: {str(e)}")
            raise
    
    def _calculate_security_score(self, severity_distribution: Dict[str, int], total_issues: int) -> int:
        """Calculate overall security score (0-100)"""
        
        if total_issues == 0:
            return 100
        
        # Weight different severities
        weights = {
            SecuritySeverity.CRITICAL.value: 25,
            SecuritySeverity.HIGH.value: 15,
            SecuritySeverity.MEDIUM.value: 8,
            SecuritySeverity.LOW.value: 3,
            SecuritySeverity.INFO.value: 1
        }
        
        penalty = 0
        for severity, count in severity_distribution.items():
            penalty += count * weights.get(severity, 0)
        
        # Calculate score (higher penalty = lower score)
        score = max(0, 100 - penalty)
        return min(100, score)
    
    def _generate_security_recommendations(
        self,
        severity_distribution: Dict[str, int],
        issues: List[SecurityIssue]
    ) -> List[str]:
        """Generate security recommendations based on scan results"""
        
        recommendations = []
        
        # Critical and high severity issues
        critical_high_count = severity_distribution.get(SecuritySeverity.CRITICAL.value, 0) + \
                             severity_distribution.get(SecuritySeverity.HIGH.value, 0)
        
        if critical_high_count > 0:
            recommendations.append(f"🚨 CRITICAL: Address {critical_high_count} high/critical security issues immediately")
        
        # Secret leaks
        secret_leaks = [issue for issue in issues if issue.issue_type == SecurityIssueType.SECRET_LEAK]
        if secret_leaks:
            recommendations.append(f"🔐 SECRETS: {len(secret_leaks)} secrets detected - rotate immediately")
        
        # Dependency vulnerabilities
        dep_vulns = [issue for issue in issues if issue.issue_type == SecurityIssueType.VULNERABILITY]
        if dep_vulns:
            recommendations.append(f"📦 DEPENDENCIES: Update {len(dep_vulns)} vulnerable dependencies")
        
        # Code quality issues
        code_issues = [issue for issue in issues if issue.issue_type == SecurityIssueType.CODE_QUALITY]
        if code_issues:
            recommendations.append(f"💻 CODE: Fix {len(code_issues)} code quality issues")
        
        # General recommendations
        if severity_distribution.get(SecuritySeverity.MEDIUM.value, 0) > 10:
            recommendations.append("⚠️ MEDIUM: High number of medium severity issues - review and prioritize")
        
        if not recommendations:
            recommendations.append("✅ Security scan passed - no critical issues found")
        
        return recommendations


# Example usage
async def main():
    """Example usage of runtime security scanner"""
    
    scanner = RuntimeSecurityScanner(
        github_token="your-github-token",
        semgrep_token="your-semgrep-token"
    )
    
    # Run comprehensive scan
    scan_results = await scanner.run_comprehensive_scan("./")
    
    # Generate security report
    report = await scanner.generate_security_report(scan_results)
    
    print(f"Security Score: {report['summary']['security_score']}/100")
    print(f"Total Issues: {report['summary']['total_issues']}")
    print(f"Recommendations: {report['recommendations']}")


if __name__ == "__main__":
    asyncio.run(main())
