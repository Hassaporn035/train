getBatchReviewDetail(projectId: string): Observable<Pmdt01BatchReviewDetailResponse> {
		return this.http.get<Pmdt01BatchReviewDetailResponse>(this.programId + '/batchReview', {
			params: { projectId }
		});
	}

	getBatchReviewDeviations(projectId: string): Observable<Pmdt01BatchReviewDeviationRow[]> {
		return this.http.get<Pmdt01BatchReviewDeviationRow[]>(this.programId + '/batchReview/deviations', {
			params: { projectId }
		});
	}

	getBatchReviewSignatures(projectId: string): Observable<Pmdt01BatchReviewSignatureRow[]> {
		return this.http.get<Pmdt01BatchReviewSignatureRow[]>(this.programId + '/batchReview/signatures', {
			params: { projectId }
		});
	}

	approveBatchReview(projectId: string): Observable<void> {
		return this.http.post<void>(this.programId + '/batchReview/approve', { projectId });
	}

	rejectBatchReview(projectId: string, comment: string): Observable<void> {
		return this.http.post<void>(this.programId + '/batchReview/reject', { projectId, comment });
	}


	
/** Batch review (PMDT01) — aligns with `BatchReviewDetailDto` from API. */
export interface Pmdt01BatchReviewDetailResponse {
	header: Pmdt01BatchReviewHeaderDto;
	snapshot: Pmdt01BatchReviewSnapshotDto;
	deviations: Pmdt01BatchReviewDeviationRow[];
	signatures: Pmdt01BatchReviewSignatureRow[];
}

export interface Pmdt01BatchReviewHeaderDto {
	projectId: string;
	projectCode: string;
	projectName: string;
	currentStageCode: string;
	currentStageName: string;
	startDate?: DateInput;
	endDate?: DateInput;
	openDeviationsCount: number;
	missingVerificationsCount: number;
	pendingSignaturesCount: number;
}

export interface Pmdt01BatchReviewSnapshotDto {
	massBalance: Pmdt01BatchReviewMassBalanceSnapshotDto;
	deviationSummary: Pmdt01BatchReviewDeviationSnapshotDto;
	criticalVerification: Pmdt01BatchReviewVerificationSnapshotDto;
	pendingSignatures: Pmdt01BatchReviewSignatureSnapshotDto;
}

export interface Pmdt01BatchReviewMassBalanceSnapshotDto {
	totalOutputSummary: string;
	theoreticalYieldPercent?: number | null;
}

export interface Pmdt01BatchReviewDeviationSnapshotDto {
	openCount: number;
	closedCount: number;
	highestSeverityCode?: string | null;
}

export interface Pmdt01BatchReviewVerificationSnapshotDto {
	completionPercent: number;
	completedCount: number;
	totalCount: number;
}

export interface Pmdt01BatchReviewSignatureSnapshotDto {
	outstandingCount: number;
	allSignaturesComplete: boolean;
}

export interface Pmdt01BatchReviewDeviationRow {
	deviationId?: string | null;
	severity: string;
	occurredAt?: DateInput;
	areaEquipment: string;
	description: string;
	status: string;
	capaLinkUrl?: string | null;
}

export interface Pmdt01BatchReviewSignatureRow {
	stepId: string;
	taskId: string;
	taskName: string;
	stepName: string;
	requiredRole: string;
	status: string;
	signerName?: string | null;
	signedAt?: DateInput;
}


[HttpGet("batchReview")]
public async Task<IActionResult> BatchReviewDetail([FromQuery] DetailBatchReview.Query model)
{
	return Ok(await Mediator.Send(model));
}

[HttpGet("batchReview/deviations")]
public async Task<IActionResult> BatchReviewDeviations([FromQuery] ListBatchReviewDeviations.Query model)
{
	IReadOnlyList<BatchReviewDeviationDto> rows = await Mediator.Send(model);
	return Ok(rows);
}

[HttpGet("batchReview/signatures")]
public async Task<IActionResult> BatchReviewSignatures([FromQuery] ListBatchReviewSignatures.Query model)
{
	IReadOnlyList<BatchReviewSignatureDto> rows = await Mediator.Send(model);
	return Ok(rows);
}

[HttpPost("batchReview/approve")]
public async Task<IActionResult> BatchReviewApprove([FromBody] ApproveBatchReview.Command model)
{
	return Ok(await Mediator.Send(model));
}

[HttpPost("batchReview/reject")]
public async Task<IActionResult> BatchReviewReject([FromBody] RejectBatchReview.Command model)
{
	return Ok(await Mediator.Send(model));
}

#endregion