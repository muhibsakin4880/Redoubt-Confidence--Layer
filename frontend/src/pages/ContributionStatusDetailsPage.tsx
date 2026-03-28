import { useParams } from 'react-router-dom';

interface Params {
  datasetId: string;
}

const ContributionStatusDetailsPage = () => {
  const { datasetId } = useParams<Params>();
  // The rest of your component logic
};

export default ContributionStatusDetailsPage;