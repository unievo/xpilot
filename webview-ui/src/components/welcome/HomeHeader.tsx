import AgentLogo from "@/assets/AgentLogo"
import ClineLogoVariable from "@/assets/ClineLogoVariable"
import HeroTooltip from "@/components/common/HeroTooltip"
import { agentName } from "@shared/Configuration"

const HomeHeader = () => {
	return (
		<div
			style={{
				//display: "flex",
				//flexDirection: "column",
				alignItems: "left",
				textAlign: "left",
				paddingLeft: "0px",
				paddingRight: "5px",
				paddingBottom: "10px",
				marginLeft: "20px",
				marginRight: "0px",
			}}>
			<div>
				<h2 style={{ opacity: 0.8 }}>{`Dashboard`}</h2>
			</div>

			<div>
				<div
					style={{
						//display: "flex",
						//flexDirection: "column",
						alignItems: "left",
						textAlign: "left",
						//maxWidth: "350px",
					}}>
					<p style={{ fontSize: "12px", marginLeft: "13px", opacity: 0.7 }}>
						<ul style={{ listStyleType: "disc", paddingLeft: 0, paddingRight: 20 }}>
							<li>
								Use Plan mode to create a task plan and Act mode to execute. You can use different models for each
								mode and save them in settings.
							</li>
							<li>
								Start a new task each time you have a new scope. Keep your task context specific to the same
								scope.
							</li>

							<li>
								Type "/newtask" to create a new task with context from the current task. Use task history to
								switch between tasks at any time.
							</li>
							<li>
								Use task checkpoints to restore the workspace to that point. Edit a previous task message to
								restart from that point.
							</li>
						</ul>
					</p>
				</div>
			</div>
		</div>
	)
}

export default HomeHeader
