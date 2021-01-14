import React, { FC } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import Etherscan from 'containers/Etherscan';
import { FlexDivCentered, ExternalLink } from 'styles/common';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';

import {
	InfoContainer,
	SectionHeader,
	SectionSubtext,
	InfoTitle,
	InfoData,
	Container,
} from './common';
import { formatCurrency, NumericValue } from 'utils/formatters/number';

type ActionInProgressProps = {
	vestingAmount?: string;
	hash: string;
	currencyKey?: string;
	isMigration?: boolean;
};

const ActionInProgress: FC<ActionInProgressProps> = ({
	vestingAmount,
	currencyKey,
	hash,
	isMigration = false,
}) => {
	const { t } = useTranslation();
	const { etherscanInstance } = Etherscan.useContainer();
	const link = etherscanInstance != null ? etherscanInstance.txLink(hash) : undefined;
	return (
		<Container>
			<SectionHeader>
				{isMigration
					? t('escrow.actions.migration.in-progress.title')
					: t('escrow.actions.in-progress.title')}
			</SectionHeader>
			<Svg src={PendingConfirmation} />
			<FlexDivCentered>
				<InfoContainer key="one">
					<InfoTitle>
						{isMigration
							? t('escrow.actions.migration.in-progress.migrating')
							: t('escrow.actions.in-progress.vesting')}
					</InfoTitle>
					<InfoData>
						{isMigration
							? t('escrow.actions.migration.in-progress.escrow-schedule')
							: formatCurrency(currencyKey as string, vestingAmount as NumericValue, {
									currencyKey: currencyKey,
							  })}
					</InfoData>
				</InfoContainer>
			</FlexDivCentered>
			<SectionSubtext>{t('escrow.actions.in-progress.subtext')}</SectionSubtext>
			{link ? (
				<StyledExternalLink href={link}>
					{t('escrow.actions.in-progress.etherscan')}
				</StyledExternalLink>
			) : null}
		</Container>
	);
};

const StyledExternalLink = styled(ExternalLink)`
	margin-top: 25px;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.blue};
	font-size: 12px;
`;

export default ActionInProgress;
